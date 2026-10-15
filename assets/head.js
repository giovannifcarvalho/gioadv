/* Carregado no <head> de todas as páginas, logo depois do Tailwind.
   Configuração do Tailwind (cores e fontes da marca) + Google Analytics. */

tailwind.config = {
    theme: {
        extend: {
            colors: { 'brand-green': '#1e392a', 'brand-gold': '#c2a56c' },
            fontFamily: { 'serif': ['Cormorant Garamond', 'serif'], 'sans': ['Lato', 'sans-serif'] }
        }
    }
};

(function () {
    var GA_ID = 'G-VVD6LJLG0H';
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
})();
