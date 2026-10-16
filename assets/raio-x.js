/* Raio-X Jurídico da Startup (raio-x.html)
   Lê as perguntas de raio-x.json, mostra uma pergunta por vez e calcula o resultado por área.
   Nada é enviado nem salvo: as respostas ficam só na memória da página.
   Eventos do Analytics (só com consentimento): raio_x_inicio, raio_x_conclusao, raio_x_pdf. */

(function () {
    'use strict';

    var WA_NUMBER = '5531991466737';
    var FAIXAS = {
        risco:   { rotulo: 'Risco relevante',  curto: 'Risco',    emoji: '🔴', acesos: 1, ordem: 0 },
        atencao: { rotulo: 'Ponto de atenção', curto: 'Atenção',  emoji: '🟡', acesos: 2, ordem: 1 },
        ok:      { rotulo: 'Em ordem',         curto: 'Em ordem', emoji: '🟢', acesos: 3, ordem: 2 },
        na:      { rotulo: 'Não se aplica', curto: 'Não se aplica', emoji: '⚪', acesos: 0, ordem: 3 }
    };

    var $ = function (id) { return document.getElementById(id); };
    var telas = { intro: $('rx-intro'), perguntas: $('rx-perguntas'), resultado: $('rx-resultado') };
    var botaoComecar = $('rx-comecar');

    var dados = null;
    var respostas = {};   // chave da pergunta -> índice da opção escolhida
    var atual = 0;
    var ultimoResultado = null;
    var avancando = false;   // evita pular duas perguntas com toque duplo

    function evento(nome, parametros) { if (window.gcEvento) window.gcEvento(nome, parametros); }

    function escapeHtml(texto) {
        return String(texto == null ? '' : texto).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // ---------- Lista de perguntas (muda conforme as respostas do perfil) ----------
    function eixoPulado(eixo) {
        return eixo.pularSe && respostas[eixo.pularSe.pergunta] === eixo.pularSe.opcao;
    }

    function passos() {
        var lista = dados.perfil.map(function (p) {
            return { chave: p.id, area: 'Sobre a empresa', pergunta: p.pergunta,
                     opcoes: p.opcoes.map(function (t) { return { texto: t }; }) };
        });
        dados.eixos.forEach(function (eixo) {
            if (eixoPulado(eixo)) return;
            eixo.perguntas.forEach(function (p, i) {
                lista.push({ chave: eixo.id + '-' + i, area: eixo.nome, pergunta: p.pergunta, opcoes: p.opcoes });
            });
        });
        return lista;
    }

    // ---------- Telas e histórico do navegador (o "voltar" do celular volta uma pergunta) ----------
    function mostrar(nome) {
        Object.keys(telas).forEach(function (k) { telas[k].hidden = k !== nome; });
        window.scrollTo(0, 0);
    }

    function irPara(estado, substituir) {
        if (substituir) history.replaceState(estado, '');
        else history.pushState(estado, '');
        aplicarEstado(estado);
    }

    function aplicarEstado(estado) {
        if (!estado || !dados) { mostrar('intro'); return; }
        if (estado.resultado && ultimoResultado) { mostrar('resultado'); return; }
        if (typeof estado.passo === 'number') { atual = Math.min(estado.passo, passos().length - 1); desenharPergunta(); return; }
        mostrar('intro');
    }

    window.addEventListener('popstate', function (e) { aplicarEstado(e.state); });

    // ---------- Pergunta ----------
    function desenharPergunta() {
        var lista = passos();
        var p = lista[atual];
        mostrar('perguntas');

        $('rx-area').textContent = p.area;
        $('rx-contador').textContent = (atual + 1) + ' de ' + lista.length;
        var pct = Math.round((atual / lista.length) * 100);
        $('rx-barra').style.width = pct + '%';
        telas.perguntas.querySelector('[role=progressbar]').setAttribute('aria-valuenow', pct);

        var escolhida = respostas[p.chave];
        $('rx-pergunta').innerHTML =
            '<h2 id="rx-enunciado" tabindex="-1" class="text-2xl md:text-4xl font-bold text-brand-green leading-tight mb-7 outline-none">' + escapeHtml(p.pergunta) + '</h2>' +
            '<div class="space-y-3" role="group" aria-labelledby="rx-enunciado">' +
            p.opcoes.map(function (o, i) {
                return '<button type="button" class="rx-opcao' + (escolhida === i ? ' rx-opcao-escolhida' : '') + '" data-opcao="' + i + '" aria-pressed="' + (escolhida === i) + '">' +
                           '<span class="rx-opcao-marca" aria-hidden="true"></span><span>' + escapeHtml(o.texto) + '</span>' +
                       '</button>';
            }).join('') +
            '</div>';

        $('rx-voltar').style.visibility = atual === 0 ? 'hidden' : 'visible';
        var titulo = $('rx-enunciado');
        if (titulo && titulo.focus) titulo.focus({ preventScroll: true });
    }

    $('rx-pergunta').addEventListener('click', function (e) {
        var botao = e.target.closest('.rx-opcao');
        if (!botao || avancando) return;
        avancando = true;
        var lista = passos();
        respostas[lista[atual].chave] = Number(botao.getAttribute('data-opcao'));
        Array.prototype.forEach.call(this.querySelectorAll('.rx-opcao'), function (b) {
            b.classList.toggle('rx-opcao-escolhida', b === botao);
            b.setAttribute('aria-pressed', b === botao);
        });
        // pequena pausa para a pessoa ver a opção marcada antes de avançar
        setTimeout(function () {
            avancando = false;
            var novaLista = passos();   // a resposta sobre sócios pode tirar perguntas da lista
            if (atual + 1 < novaLista.length) irPara({ passo: atual + 1 });
            else concluir();
        }, 220);
    });

    $('rx-voltar').addEventListener('click', function () { history.back(); });

    // ---------- Resultado ----------
    function faixaDaMedia(m) { return m >= 1.75 ? 'ok' : m >= 1 ? 'atencao' : 'risco'; }

    function calcular() {
        var areas = dados.eixos.map(function (eixo) {
            var pontos = [], naoSei = false;
            if (!eixoPulado(eixo)) {
                eixo.perguntas.forEach(function (p, i) {
                    var o = p.opcoes[respostas[eixo.id + '-' + i]];
                    if (!o) return;
                    if (o.naoSei) naoSei = true;
                    if (o.pontos !== null && o.pontos !== undefined) pontos.push(o.pontos);
                });
            }
            var faixa = pontos.length ? faixaDaMedia(pontos.reduce(function (a, b) { return a + b; }, 0) / pontos.length) : 'na';
            var texto = eixo.resultados[faixa === 'na' ? 'naoSeAplica' : faixa] || eixo.resultados.ok;
            return { eixo: eixo, faixa: faixa, texto: texto, naoSei: naoSei };
        });

        var conta = { risco: 0, atencao: 0, ok: 0, na: 0 };
        areas.forEach(function (a) { conta[a.faixa]++; });
        var geral = conta.risco === 0 && conta.atencao <= 1 ? 'bom' : conta.risco <= 2 ? 'medio' : 'fragil';
        var fase = dados.perfil[0].opcoes[respostas[dados.perfil[0].id]] || '';
        return { areas: areas, conta: conta, geral: geral, fase: fase };
    }

    function termometro(faixa) {
        var acesos = FAIXAS[faixa].acesos, html = '';
        for (var i = 0; i < 3; i++) html += '<span' + (i < acesos ? ' class="rx-aceso"' : '') + '></span>';
        return '<div class="rx-termometro" aria-hidden="true">' + html + '</div>';
    }

    function mensagemWhatsapp(r) {
        var linhas = ['Olá, Giovanni! Fiz o Raio-X Jurídico da Startup.'];
        if (r.fase) linhas.push('Fase: ' + r.fase);
        ['risco', 'atencao', 'ok'].forEach(function (f) {
            var nomes = r.areas.filter(function (a) { return a.faixa === f; }).map(function (a) { return a.eixo.nome; });
            if (nomes.length) linhas.push(FAIXAS[f].emoji + ' ' + FAIXAS[f].curto + ': ' + nomes.join(', '));
        });
        linhas.push('Gostaria de conversar sobre por onde começar.');
        return linhas.join('\n');
    }

    function desenharResultado(r) {
        var t = dados.titulos[r.geral];
        $('rx-titulo').textContent = t.titulo;
        $('rx-subtitulo').textContent = t.texto;

        $('rx-resumo').innerHTML = ['risco', 'atencao', 'ok'].filter(function (f) { return r.conta[f]; }).map(function (f) {
            return '<span class="rx-chip rx-' + f + '"><span class="rx-ponto"></span>' + r.conta[f] + ' ' +
                   (r.conta[f] === 1 ? 'área' : 'áreas') + ' · ' + FAIXAS[f].curto.toLowerCase() + '</span>';
        }).join('');

        // o mais urgente primeiro
        var ordenadas = r.areas.slice().sort(function (a, b) { return FAIXAS[a.faixa].ordem - FAIXAS[b.faixa].ordem; });
        $('rx-cartoes').innerHTML = ordenadas.map(function (a) {
            return '<article class="rx-cartao rx-' + a.faixa + '">' +
                       '<div class="flex items-start justify-between gap-3 mb-3">' +
                           '<h3 class="text-2xl font-bold text-brand-green leading-tight">' + escapeHtml(a.eixo.nome) + '</h3>' +
                           '<span class="rx-selo">' + FAIXAS[a.faixa].rotulo + '</span>' +
                       '</div>' +
                       termometro(a.faixa) +
                       '<p class="text-gray-700 leading-relaxed mt-4">' + escapeHtml(a.texto) + '</p>' +
                       (a.naoSei ? '<p class="rx-nao-sei">' + escapeHtml(dados.naoSei) + '</p>' : '') +
                       '<a href="' + escapeHtml(a.eixo.landing) + '" class="rx-link">Conhecer ' + escapeHtml(a.eixo.area) + ' &rarr;</a>' +
                   '</article>';
        }).join('');

        $('rx-whatsapp').href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(mensagemWhatsapp(r));
    }

    function concluir() {
        $('rx-barra').style.width = '100%';
        ultimoResultado = calcular();
        desenharResultado(ultimoResultado);
        var params = { fase: ultimoResultado.fase, resultado_geral: ultimoResultado.geral,
                       areas_risco: ultimoResultado.conta.risco, areas_atencao: ultimoResultado.conta.atencao };
        ultimoResultado.areas.forEach(function (a) { params['area_' + a.eixo.id] = a.faixa; });
        evento('raio_x_conclusao', params);
        irPara({ resultado: true });
    }

    // ---------- PDF (pela impressão do navegador: "Salvar como PDF") ----------
    $('rx-pdf').addEventListener('click', function () {
        var empresa = $('rx-empresa').value.trim();
        $('rx-pdf-empresa').textContent = empresa ? empresa + ' · ' : '';
        $('rx-pdf-data').textContent = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        var tituloOriginal = document.title;
        document.title = 'Raio-X Jurídico' + (empresa ? ' - ' + empresa : ' da Startup');   // vira o nome sugerido do arquivo
        evento('raio_x_pdf', { com_nome_empresa: empresa ? 'sim' : 'nao' });
        window.addEventListener('afterprint', function restaurar() {
            document.title = tituloOriginal;
            window.removeEventListener('afterprint', restaurar);
        });
        window.print();
    });

    // ---------- Início ----------
    function comecar() {
        respostas = {};
        ultimoResultado = null;
        evento('raio_x_inicio', {});
        irPara({ passo: 0 });
    }
    botaoComecar.addEventListener('click', comecar);
    $('rx-refazer').addEventListener('click', comecar);

    fetch('raio-x.json')
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (json) {
            dados = json;
            botaoComecar.disabled = false;
            history.replaceState(null, '');   // ao recarregar a página, começa da apresentação
        })
        .catch(function () {
            botaoComecar.insertAdjacentHTML('afterend',
                '<p class="text-brand-gold mt-4">Não foi possível carregar o raio-x agora. Recarregue a página em instantes.</p>');
        });
})();
