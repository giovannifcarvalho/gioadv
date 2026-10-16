/* Configuração do Tailwind usada para gerar assets/tailwind.css.
   O CSS é gerado automaticamente pelo GitHub (.github/workflows/build.yml) a cada
   alteração no site: ele procura as classes usadas nas páginas e no site.js e inclui só elas. */
module.exports = {
  content: ['./*.html', './assets/*.js'],
  theme: {
    extend: {
      colors: { 'brand-green': '#1e392a', 'brand-gold': '#c2a56c' },
      fontFamily: { serif: ['Cormorant Garamond', 'serif'], sans: ['Lato', 'sans-serif'] }
    }
  }
};
