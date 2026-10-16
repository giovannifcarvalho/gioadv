/* Carregado no <head> de todas as páginas.
   (As cores e fontes do Tailwind ficam em tailwind.config.js; o CSS é gerado em assets/tailwind.css.)
   Google Analytics SÓ com consentimento: nada é carregado nem enviado ao Google
      até o visitante clicar em "Aceitar" no aviso de cookies (exibido por site.js).
      A escolha fica salva no navegador (localStorage) e pode ser alterada a qualquer
      momento pelo link "Preferências de cookies" no rodapé. */

(function () {
    var GA_ID = 'G-VVD6LJLG0H';
    var CHAVE = 'gc-consentimento-cookies';   // valores: "aceito" ou "recusado"
    var carregado = false;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };

    function ler() {
        try { return localStorage.getItem(CHAVE); } catch (e) { return null; }
    }
    function salvar(valor) {
        try { localStorage.setItem(CHAVE, valor); } catch (e) { /* navegador sem armazenamento: vale só nesta visita */ }
    }

    function carregarAnalytics() {
        if (carregado) return;
        carregado = true;
        window['ga-disable-' + GA_ID] = false;
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);
        gtag('js', new Date());
        gtag('config', GA_ID);
    }

    // Ao recusar depois de ter aceitado: desliga o Analytics e apaga os cookies _ga
    function desligarAnalytics() {
        window['ga-disable-' + GA_ID] = true;
        var host = location.hostname.replace(/^www\./, '');
        document.cookie.split(';').forEach(function (c) {
            var nome = c.split('=')[0].trim();
            if (nome.indexOf('_ga') !== 0) return;
            ['', '; domain=' + host, '; domain=.' + host].forEach(function (dominio) {
                document.cookie = nome + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + dominio;
            });
        });
    }

    // Usado por site.js (aviso de cookies e eventos)
    window.gcConsentimento = {
        valor: ler,
        aceitar: function () { salvar('aceito'); carregarAnalytics(); },
        recusar: function () { salvar('recusado'); if (carregado) desligarAnalytics(); }
    };

    // Envia um evento ao Analytics apenas se o visitante tiver aceitado
    window.gcEvento = function (nome, parametros) {
        if (ler() !== 'aceito' || !carregado) return;
        gtag('event', nome, parametros || {});
    };

    if (ler() === 'aceito') carregarAnalytics();
})();
