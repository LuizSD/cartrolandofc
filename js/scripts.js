$(document).ready(function() {

  function searchTeam() {
    var $team_input = $("#team"),
        team = decodeURI($team_input.val()).toLowerCase();
    
    if (team === "") {
      alert("Digite o nome do seu time para consultar!");
      $team_input.focus();
      return false;
    }

    $.ajax({
      type: "GET",
      contentType: "application/json",
      cache: false,
      url: "load-api.php",
      data: {
        api: "busca-time",
        team: team
      },
      beforeSend: function() {
        loading("show");
        teamsList("hide");
      },
      success: function(data) {
        var teams_total = data.total;

        if (teams_total == 0) {
          alert("O time que você digitou não foi encontrado, verifique se o nome está correto!");
          $team_input.focus();
          loading("hide");
          return false;
        } else if (teams_total > 1) {
          showTeamsList(team, teams_total, 0, 20);
        } else {
          var team_slug = data.times[0].slug;
          getAthletes(team_slug);
        }
      },
      complete: function() {
        loading("hide");
      },
      error: function () {
        alert("Ocorreu algum erro ao consultar seu time!\n Aguarde alguns instantes para uma nova consulta...");
        $team_input.focus();
        loading("hide");
        return false;
      }
    });
  }

  function showTeamsList(team, teams_total, teams_per_page) {
    var $team_input = $("#team"),
        $teams_list = $("#teams_list");

    $.ajax({
      type: "GET",
      contentType: "application/json",
      cache: false,
      url: "load-api.php",
      data: {
        api: "busca-time",
        team: team
      },
      beforeSend: function() {
        $teams_list.html("");
        teamsList("hide");
        loading("show");
      },
      success: function(data) {
        var teams = data.times,
            team_row_content = "<ul class='teams'>";

        for (var i=0; i < teams.length; i++) {
          var team_slug = teams[i].slug,
              team_nome = teams[i].nome,
              team_escudo = teams[i].imagens_escudo.img_escudo_32x32,
              team_nome = teams[i].nome,
              team_cartoleiro = teams[i].nome_cartola;

          team_row_content += " \
            <li data-slug='"+ team_slug +"' data-nome='"+ team_nome +"'> \
              <img src="+ team_escudo +" class='escudo'> \
              <div class='nome'>"+ team_nome +"</div> \
              <div class='cartola'>"+ team_cartoleiro +"</div> \
            </li> \
          \n";
        }
        
        team_row_content += "</ul>";

        $teams_list.append(team_row_content);
        
        $teams_list.find("li").on("click", function() {
          teamsList("hide");
          $team_input.val("").val($(this).data("nome"));
          getAthletes($(this).data("slug"));
        });

        teamsList("show");
      },
      complete: function() {
        loading("hide");
      },
      error: function () {
        alert("Ocorreu algum erro ao consultar a lista de times! Tente novamente ou aguarde alguns instantes para uma nova consulta...");
        $team.focus();
        $teams_list.html("");
        teamsList("hide");
        loading("hide");
        return false;
      }
    });
  }

  function getAthletes(team_slug) {
    var $team_input = $("#team"),
        $result = $("#result"),
        $team_escudo = $(".team_escudo"),
        $team_nome = $(".team_nome h1"),
        $team_cartola = $(".team_nome h3"),
        $team_rodada = $(".team_rodada"),
        $team_pontuacao = $(".team_pontuacao"),
        $team_escalacao = $(".team_escalacao table"),
        team_slug = team_slug;

    $.ajax({
      type: "GET",
      contentType: "application/json",
      cache: false,
      url: "load-api.php",
      data: {
        api: "busca-atletas",
        team_slug: team_slug
      },
      beforeSend: function() {
        $team_escudo.html("");
        $team_nome.html("");
        $team_cartola.html("");
        $team_rodada.html("");
        $team_pontuacao.html("");
        $team_escalacao.html("");
        
        loading("show");
      },
      success: function(data) {
        if (typeof data.errors !== "undefined") {
          alert(data.errors.error.message);
          $team_input.focus();
          loading("hide");
          return false;
        }

        var request = data,
            athletics = request.atleta,
            team = (request.time == "" ? "---" : request.time),
            team_escudo = (team.imagens_escudo == "" ? "---" : team.imagens_escudo.img_escudo_160x160),
            team_nome = (team.nome == "" ? "---" : team.nome),
            team_cartola = (team.nome_cartola == "" ? "---" : team.nome_cartola),
            team_patrimonio = (team.patrimonio == "" ? "---" : team.patrimonio),
            team_rodada = (team.rodada == "" ? "---" : team.rodada),
            team_pontuacao = (team.pontuacao == "" ? "---" : team.pontuacao),
            escalacao_rows = "<tbody>";

        $team_escudo.html("<img src="+ team_escudo +">");
        $team_nome.html(team_nome);
        $team_cartola.html(team_cartola);
        $team_rodada.html(team_rodada + "ª Rodada");
        $team_pontuacao.html("<span class='pontos-label'>"+ team_pontuacao + "</span> <span class='pontuacao-label'>Pontos parciais</span>");

        $.each(athletics, function(inc, data) {
          var athletic_escudo = (data.clube.escudo_pequeno == "" ? "---" : data.clube.escudo_pequeno),
              athletic_posicao = (data.posicao.abreviacao == "" ? "---" : data.posicao.abreviacao),
              athletic_nome = (data.apelido == "" ? "---" : data.apelido.toUpperCase()),
              athletic_pontos = (data.pontos == "" ? "---" : data.pontos);

          escalacao_rows += " \
          <tr> \
          <td class='athletic_escudo'><img src='"+ athletic_escudo +"'></td> \
          <td class='athletic_posicao'>"+ athletic_posicao +"</td> \
          <td class='athletic_nome'>"+ athletic_nome +"</td> \
          <td class='athletic_pontos'>"+ athletic_pontos +"</td> \
          </tr> \
          ";
        });

        $team_escalacao.append(escalacao_rows);

        $(".athletic_pontos").each(function() {
          $(this).removeClass("neutro negativo");

          if ($(this).html().indexOf("---") == 0) {
            $(this).addClass("neutro");
          } else if ($(this).html().indexOf("-") == 0) {
            $(this).addClass("negativo");
          }
        })
        
        $result.show();
      },
      complete: function() {
        loading("hide");
      },
      error: function () {
        alert("Ocorreu algum erro ao consultar os atletas do seu time! Tente novamente ou aguarde alguns instantes para uma nova consulta...");
        $team_input.focus();
        loading("hide");
        return false;
      }
    });
  }

  
  function loading(status) {
    var $loading = $("#loading");

    if (status == "show") {
      $loading.show();
    } else if (status == "hide") {
      $loading.hide();
    } else {
      $loading.show();
    }
  }

  function teamsList(status) {
    var $teams_list = $("#teams_list");

    if (status == "show") {
      $teams_list.show();
    } else if (status == "hide") {
      $teams_list.hide();
    } else {
      $teams_list.show();
    }
  }

  $("#search").on("click", function() {
    searchTeam();
  });

  $("#team").keypress(function(e) {
    if (e.which == 13) {
      searchTeam();
    }
  });

});