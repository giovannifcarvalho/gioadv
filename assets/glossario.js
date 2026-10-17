/* Glossário Jurídico para Startups (glossario.html): busca, filtro por área e cópia do link de cada termo.
   O conteúdo dos termos já vem escrito na página (gerado a partir de glossario.json).
   Eventos do Analytics (só com consentimento): glossario_busca, glossario_filtro, glossario_copiar_link. */

(function () {
    'use strict';

    var campo = document.getElementById('gl-campo');
    var filtros = document.getElementById('gl-filtros');
    var status = document.getElementById('gl-status');
    var vazio = document.getElementById('gl-vazio');
    var indice = document.querySelector('.gl-indice');
    var areas = Array.prototype.slice.call(document.querySelectorAll('.gl-area'));
    var termos = Array.prototype.slice.call(document.querySelectorAll('.gl-termo'));
    var total = termos.length;
    var areaAtual = '';
    var temporizadorEvento = null;

    function evento(nome, parametros) { if (window.gcEvento) window.gcEvento(nome, parametros); }

    function semAcento(texto) {
        return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    }

    function aplicar() {
        var palavras = semAcento(campo.value).split(/\s+/).filter(Boolean);
        var visiveis = 0;

        areas.forEach(function (area) {
            var naArea = 0;
            var areaOk = !areaAtual || area.getAttribute('data-area') === areaAtual;
            Array.prototype.forEach.call(area.querySelectorAll('.gl-termo'), function (t) {
                var texto = t.getAttribute('data-busca');
                var ok = areaOk && palavras.every(function (p) { return texto.indexOf(p) !== -1; });
                t.hidden = !ok;
                if (ok) naArea++;
            });
            area.hidden = naArea === 0;
            visiveis += naArea;
        });

        var filtrando = palavras.length || areaAtual;
        if (indice) indice.hidden = !!filtrando;
        vazio.hidden = visiveis > 0;
        status.textContent = filtrando && visiveis
            ? visiveis + (visiveis === 1 ? ' termo encontrado' : ' termos encontrados') + ' de ' + total + '.'
            : '';
    }

    campo.addEventListener('input', function () {
        aplicar();
        // registra a busca só quando a pessoa para de digitar
        clearTimeout(temporizadorEvento);
        var valor = campo.value.trim();
        if (valor.length < 2) return;
        temporizadorEvento = setTimeout(function () {
            evento('glossario_busca', { busca: valor.slice(0, 60), resultados: termos.filter(function (t) { return !t.hidden; }).length });
        }, 1200);
    });

    filtros.addEventListener('click', function (e) {
        var chip = e.target.closest('.gl-chip');
        if (!chip) return;
        areaAtual = chip.getAttribute('data-area');
        Array.prototype.forEach.call(filtros.querySelectorAll('.gl-chip'), function (c) {
            c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
        });
        aplicar();
        evento('glossario_filtro', { area: areaAtual || 'todas' });
        var alvo = document.getElementById('gl-status');
        if (alvo.getBoundingClientRect().top < 0) alvo.scrollIntoView({ block: 'start' });
    });

    // ---------- Link de cada termo ----------
    var aviso = document.getElementById('gl-aviso-copiado');
    var temporizadorAviso = null;
    function mostrarAviso(texto) {
        aviso.textContent = texto;
        aviso.classList.add('gl-aviso-visivel');
        clearTimeout(temporizadorAviso);
        temporizadorAviso = setTimeout(function () { aviso.classList.remove('gl-aviso-visivel'); }, 2200);
    }

    document.addEventListener('click', function (e) {
        var botao = e.target.closest('[data-copiar]');
        if (!botao) return;
        e.preventDefault();
        var termo = botao.closest('.gl-termo');
        var url = location.origin + location.pathname + '#' + termo.id;
        history.replaceState(null, '', '#' + termo.id);
        destacar(termo);
        evento('glossario_copiar_link', { termo: termo.id });
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(function () { mostrarAviso('Link copiado'); },
                                                    function () { mostrarAviso('Link no endereço da página'); });
        } else {
            mostrarAviso('Link no endereço da página');
        }
    });

    // ---------- Termo aberto por link direto (glossario.html#vesting) ----------
    function destacar(termo) {
        termos.forEach(function (t) { t.classList.remove('gl-destaque'); });
        termo.classList.add('gl-destaque');
    }
    function abrirDoEndereco() {
        var id = decodeURIComponent(location.hash.slice(1));
        var termo = id && document.getElementById(id);
        if (!termo || !termo.classList.contains('gl-termo')) return;
        if (termo.hidden) {   // estava escondido por um filtro: limpa os filtros
            campo.value = '';
            areaAtual = '';
            Array.prototype.forEach.call(filtros.querySelectorAll('.gl-chip'), function (c) {
                c.setAttribute('aria-pressed', c.getAttribute('data-area') === '' ? 'true' : 'false');
            });
            aplicar();
        }
        destacar(termo);
        termo.scrollIntoView({ block: 'center' });
    }
    window.addEventListener('hashchange', abrirDoEndereco);

    aplicar();
    if (location.hash) abrirDoEndereco();
})();
