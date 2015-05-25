
$(document).ready(function() {

	function getTeam() {

    var $team = $("#team"),
        team_val_search = decodeURI($team.val()).toLowerCase(),
        $btn_search = $("#search"),
        $loading = $("#loading"),
        $result = $("#result"),

        $team_escudo = $(".team_escudo"),
        $team_nome = $(".team_nome h1"),
        $team_cartola = $(".team_nome h3");
        $team_rodada = $(".team_rodada");
        $team_pontuacao = $(".team_pontuacao");
        $team_escalacao = $(".team_escalacao table"),

				page_rows = 20;

    if (team_val_search == "") {

      alert("Digite o nome do seu time para consultar!");
      $team.focus();
      return false;

	  } else {

			$btn_search.button("loading");

    }

    /* GET TEAM SLUG */
    $.ajax({
      type: "get",
      url: "http://api.cartola.globo.com/time/busca.jsonp",
      dataType: "jsonp",
      data: {
        nome: team_val_search
      },
      beforeSend: function() {
        $loading.show();
        $result.hide();
      },
      success: function(data, textStatus, xhr) {

				var pages = data.total / page_rows;
				var has_pagination = false;

				if (data.total == 0) {
					alert("O time que você digitou não foi encontrado, verifique se o nome está correto!");
					$team.focus();
					$loading.hide();
					$btn_search.button("reset");
					return false;

				} else if (data.total > 1) {
					has_pagination = true;
				}

				// TODO: Criar lista dos times retornados
				// console.log(Math.ceil(pages));
				// console.log(data.total);
				// console.log(has_pagination);
				// return false;

        var request = data.times[0],
            team_slug = request.slug;

        /* GET TEAM INFO'S */
        $.ajax({
          type: "get",
          url: "http://api.cartola.globo.com/time_adv/"+ team_slug +".jsonp",
          dataType: "jsonp",
					timeout: 5000,
          beforeSend: function() {

            /* RESET FIELDS */
            $team_escudo.html("");
            $team_nome.html("");
            $team_cartola.html("");
            $team_rodada.html("");
            $team_pontuacao.html("");
            $team_escalacao.html("");

          },
          success: function(data, textStatus, xhr) {

						if (typeof data.errors != "undefined") {
							alert(data.errors.error.message);
							$team.focus();
							$loading.hide();
							$btn_search.button("reset");
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
                escalacao_rows = "";

            $team_escudo.html("<img src="+ team_escudo +">");
            $team_nome.html(team_nome);
            $team_cartola.html(team_cartola);
            $team_rodada.html(team_rodada + "ª Rodada");
            $team_pontuacao.html("<span class='pontos-label'>"+ team_pontuacao + "</span> <span class='pontuacao-label'>Pontos parciais</span>");

            $.each(athletics, function(inc, data) {

              athletic_escudo = (data.clube.escudo_pequeno == "" ? "---" : data.clube.escudo_pequeno);
              athletic_posicao = (data.posicao.abreviacao == "" ? "---" : data.posicao.abreviacao);
              athletic_foto = (data.foto == "" ? "" : data.foto);
              athletic_nome = (data.apelido == "" ? "---" : data.apelido.toUpperCase());
              athletic_pontos = (data.pontos == "" ? "---" : data.pontos);

              escalacao_rows += " \
              <tr> \
                <td class='athletic_escudo'><img src="+ athletic_escudo +"></td> \
                <td class='athletic_posicao'>"+ athletic_posicao +"</td> \
                <td class='athletic_foto'><img src="+ athletic_foto.replace("FORMATO","35x35") +" class='img-circle'></td> \
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

            $loading.hide();
            $result.show();

            $btn_search.button("reset");

          },
          error: function (xhr, textStatus, errorThrown) {

						alert("Ocorreu algum erro ao consultar seu time! Tente novamente ou aguarde alguns instantes para uma nova consulta...");

						$team.focus();
						$loading.hide();
						$btn_search.button("reset");
						return false;

          }

        });

      },
      error: function (xhr, textStatus, errorThrown) {

				alert("Ocorreu algum erro ao consultar seu time! Tente novamente ou aguarde alguns instantes para uma nova consulta...");

	      $team.focus();
				$loading.hide();
				$btn_search.button("reset");
	      return false;

      }

    });

	}

	$("#search").on("click", function() {
		getTeam();
	});

	$("#team").keypress(function(e) {
	  if (e.which == 13) getTeam();
  });

});
