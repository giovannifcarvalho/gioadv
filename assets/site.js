/* Partes comuns do site: cabeçalho, rodapé, menu mobile, aviso de cookies, eventos do Analytics
   e filtro do blog. Para mudar um link do menu, o e-mail, o WhatsApp ou as redes sociais, edite SÓ este arquivo.

   Cada página carrega este script logo depois de abrir o <body>:
       <body class="bg-white text-gray-800" data-page="article">
           <script src="/assets/site.js"></script>   (o build acrescenta ?v=<versão>)
   data-page pode ser "home", "blog", "article", "servicos", "sobre", "legal", "glossario" ou "landing".

   Landing pages (data-page="landing"): cabeçalho só com o logo e um botão de contato,
   sem menu, e rodapé enxuto, para o visitante não sair da página.
   data-wa-message no <body> define a mensagem do WhatsApp daquela página.

   O "?v=..." dos arquivos é carimbado automaticamente pelo build (scripts/pos-build.py)
   a partir do conteúdo de cada arquivo: não é preciso trocar nada à mão.
   Os endereços das páginas são sem ".html" (ex.: /servicos), como o Cloudflare Pages serve. */

(function () {
    'use strict';

    var page = document.body.getAttribute('data-page') || 'article';
    var onHome = page === 'home';
    var onLanding = page === 'landing';

    var EMAIL = 'giovannifcarvalho@outlook.com';
    var TELEFONE = '(31) 99146-6737';
    var LINKEDIN = 'https://www.linkedin.com/in/giovannidecarvalhoadv/';
    var INSTAGRAM = 'https://www.instagram.com/giovannidecarvalho.adv/';
    var PRAZO = 'Respondo em até 1 dia útil.';
    // Mesmo destino e mensagem do botão "Conversar sobre a minha empresa" da home.
    // Uma página pode trocar a mensagem com data-wa-message no <body>.
    var WA_NUMBER = '5531991466737';
    function whatsappLink(message) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message); }
    var WHATSAPP = whatsappLink(document.body.getAttribute('data-wa-message') ||
        'Olá, Giovanni! Vi o seu site e gostaria de conversar sobre a minha empresa.');
    var MAILTO = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Contato pelo site');

    var NAV = [
        { label: 'Serviços', href: '/servicos', active: page === 'servicos' },
        { label: 'Raio-X', href: '/raio-x', active: false },
        { label: 'Glossário', href: '/glossario', active: page === 'glossario' },
        { label: 'Sobre', href: '/sobre', active: page === 'sobre' },
        { label: 'Blog', href: '/blog', active: page === 'blog' || page === 'article' }
    ];
    var CONTATO = onHome ? '#contact' : '/#contact';   // na home, o link de Contato não recarrega a página
    var LOGO = '<img src="/assets/logo-112.png?v=053acd4fc5" width="56" height="56" alt="Giovanni de Carvalho Advocacia" class="h-12 w-12 md:h-14 md:w-14">';

    // ---------- Cabeçalho (inserido na hora, antes do conteúdo, sem "piscar") ----------
    var desktopLinks = NAV.map(function (item) {
        var cls = item.active ? 'text-brand-gold font-bold' : 'text-gray-600 hover:text-brand-gold';
        return '<a href="' + item.href + '" class="' + cls + ' transition duration-300"' + (item.active ? ' aria-current="page"' : '') + '>' + item.label + '</a>';
    }).join('');
    var mobileLinks = NAV.concat([{ label: 'Contato', href: CONTATO }]).map(function (item) {
        return '<a href="' + item.href + '" class="block text-center text-gray-700 py-3 px-4 hover:bg-gray-50">' + item.label + '</a>';
    }).join('');

    var header =
        '<header class="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">' +
            '<div class="container mx-auto px-6 py-3 flex justify-between items-center">' +
                '<a href="/" class="shrink-0" aria-label="Ir para a página inicial">' + LOGO + '</a>' +
                '<nav class="hidden md:flex space-x-8 items-center text-sm font-medium" aria-label="Menu principal">' +
                    desktopLinks +
                    '<a href="' + CONTATO + '" class="bg-brand-gold text-white px-5 py-2 rounded-md hover:opacity-90 transition duration-300">Contato</a>' +
                '</nav>' +
                '<button id="mobile-menu-button" type="button" class="md:hidden text-brand-green p-2" aria-label="Abrir menu" aria-controls="mobile-menu" aria-expanded="false">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>' +
                '</button>' +
            '</div>' +
            // posicionado sobre o conteúdo (absolute), para não empurrar a página para baixo ao abrir
            '<div id="mobile-menu" class="hidden md:hidden absolute left-0 right-0 top-full bg-white border-t border-gray-200 shadow-lg">' + mobileLinks + '</div>' +
        '</header>';

    // Landing page: sem menu, só o logo (que leva à home) e um botão de contato
    var landingHeader =
        '<header class="bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">' +
            '<div class="container mx-auto px-5 md:px-6 py-2.5 flex justify-between items-center gap-4">' +
                '<a href="/" class="shrink-0" aria-label="Ir para a página inicial">' + LOGO.replace('h-12 w-12 md:h-14 md:w-14', 'h-10 w-10 md:h-12 md:w-12') + '</a>' +
                '<a href="' + WHATSAPP + '" target="_blank" rel="noopener noreferrer" class="bg-brand-gold text-white text-sm md:text-base font-semibold px-4 md:px-5 py-2 rounded-md hover:opacity-90 transition duration-300">Fale comigo</a>' +
            '</div>' +
        '</header>';

    document.body.insertAdjacentHTML('afterbegin', onLanding ? landingHeader : header);

    if (!onLanding) {
        var menuButton = document.getElementById('mobile-menu-button');
        var menu = document.getElementById('mobile-menu');
        var setMenu = function (open) {
            menu.classList.toggle('hidden', !open);
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        };
        menuButton.addEventListener('click', function () { setMenu(menu.classList.contains('hidden')); });
        menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
        // fecha o menu ao tocar fora dele ou apertar Esc
        document.addEventListener('click', function (e) {
            if (!menu.classList.contains('hidden') && !menu.contains(e.target) && !menuButton.contains(e.target)) setMenu(false);
        });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    }

    // ---------- Botão flutuante do WhatsApp (canto inferior direito, fixo ao rolar) ----------
    // O estilo fica em assets/site.css (.whatsapp-float).
    document.body.insertAdjacentHTML('beforeend',
        '<a href="' + WHATSAPP + '" target="_blank" rel="noopener noreferrer" class="whatsapp-float" aria-label="Conversar pelo WhatsApp" title="Conversar pelo WhatsApp">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
        '</a>');

    // ---------- Rodapé ----------
    // Links legais (aparecem também nas landing pages; lá a política abre em outra aba)
    var LINKS_LEGAIS =
        '<p class="mt-3 text-sm text-gray-400">' +
            '<a href="/politica-de-privacidade"' + (onLanding ? ' target="_blank" rel="noopener"' : '') + ' class="hover:text-brand-gold underline-offset-2 hover:underline">Política de privacidade</a>' +
            ' · <button type="button" data-abrir-cookies class="hover:text-brand-gold underline-offset-2 hover:underline">Preferências de cookies</button>' +
        '</p>';

    var REDES =
        '<a href="' + LINKEDIN + '" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="text-gray-400 hover:text-brand-gold transition duration-300">' +
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.5-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>' +
        '</a>' +
        '<a href="' + INSTAGRAM + '" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="text-gray-400 hover:text-brand-gold transition duration-300">' +
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.203-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.251-.148-4.771-1.691-4.919-4.919-.058-1.265-.068-1.644-.068-4.849 0-3.204.012-3.584.069-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.21-6.78 2.618-6.99 6.985-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.947.21 4.358 2.618 6.78 6.985 6.989 1.28.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.947-.072 4.354-.21 6.782-2.618 6.989-6.985.058-1.281.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.21-4.359-2.627-6.78-6.989-6.989-1.28-.058-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4c0 2.21-1.791 4-4 4zm6.47-11.272c0-.528.43-1.078 1.078-1.078.601 0 1.079.516 1.079 1.078 0 .522-.445 1.078-1.079 1.078-.648 0-1.078-.555-1.078-1.078z"/></svg>' +
        '</a>';

    var footer =
        '<footer class="bg-gray-900 text-white"><div class="container mx-auto px-6 pt-14 pb-10">' +
            '<div class="grid gap-10 md:grid-cols-3 text-center md:text-left">' +
                '<div>' +
                    '<p class="rodape-marca">Giovanni de Carvalho | Advocacia Empresarial</p>' +
                    '<p class="text-gray-400 mt-3">Advogado · OAB/MG 243.837</p>' +
                    '<p class="text-gray-400">Belo Horizonte/MG · atendimento online em todo o Brasil</p>' +
                    '<div class="flex justify-center md:justify-start gap-5 mt-5">' + REDES + '</div>' +
                '</div>' +
                '<div>' +
                    '<p class="rodape-titulo">Contato</p>' +
                    '<p><a href="' + WHATSAPP + '" target="_blank" rel="noopener noreferrer" class="rodape-link">WhatsApp: ' + TELEFONE + '</a></p>' +
                    '<p><a href="' + MAILTO + '" class="rodape-link">' + EMAIL + '</a></p>' +
                    '<p class="text-gray-400 mt-2">' + PRAZO + '</p>' +
                '</div>' +
                '<nav aria-label="Páginas do site">' +
                    '<p class="rodape-titulo">Navegação</p>' +
                    '<ul class="space-y-1.5">' +
                        '<li><a href="/servicos" class="rodape-link">Áreas de atuação</a></li>' +
                        '<li><a href="/raio-x" class="rodape-link">Raio-X Jurídico da Startup</a></li>' +
                        '<li><a href="/glossario" class="rodape-link">Glossário jurídico</a></li>' +
                        '<li><a href="/sobre" class="rodape-link">Sobre</a></li>' +
                        '<li><a href="/blog" class="rodape-link">Blog</a></li>' +
                    '</ul>' +
                '</nav>' +
            '</div>' +
            '<div class="mt-10 border-t border-gray-800 pt-8 text-center text-gray-400"><p>&copy; ' + new Date().getFullYear() + ' Giovanni de Carvalho. Todos os direitos reservados.</p>' + LINKS_LEGAIS + '</div>' +
        '</div></footer>';

    // Rodapé das landing pages: identificação e contato, sem links para outras páginas
    var landingFooter =
        '<footer class="bg-gray-900 text-white"><div class="container mx-auto px-6 py-10 text-center text-sm">' +
            '<p class="rodape-marca">Giovanni de Carvalho | Advocacia Empresarial</p>' +
            '<p class="text-gray-400 mt-2">OAB/MG 243.837 · Belo Horizonte/MG · atendimento online em todo o Brasil</p>' +
            '<p class="mt-2"><a href="' + WHATSAPP + '" target="_blank" rel="noopener noreferrer" class="rodape-link">WhatsApp: ' + TELEFONE + '</a> · <a href="' + MAILTO + '" class="rodape-link">' + EMAIL + '</a></p>' +
            '<p class="text-gray-400 mt-1">' + PRAZO + '</p>' +
            '<p class="text-gray-400 mt-4">&copy; ' + new Date().getFullYear() + ' Giovanni de Carvalho. Todos os direitos reservados.</p>' + LINKS_LEGAIS +
        '</div></footer>';

    // ---------- Formulários que enviam para o WhatsApp ----------
    // <form data-wa-form data-wa-intro="Texto inicial"> com campos que têm data-label.
    // Ao enviar, monta a mensagem com as respostas e abre o WhatsApp.
    function setupWhatsappForms() {
        Array.prototype.forEach.call(document.querySelectorAll('form[data-wa-form]'), function (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var lines = [form.getAttribute('data-wa-intro') || 'Olá, Giovanni!'];
                var groups = {};
                Array.prototype.forEach.call(form.querySelectorAll('[data-label]'), function (field) {
                    var label = field.getAttribute('data-label');
                    if (field.type === 'checkbox') {
                        groups[label] = groups[label] || { sim: [], nao: [] };
                        groups[label][field.checked ? 'sim' : 'nao'].push(field.value);
                    } else if (field.value.trim()) {
                        lines.push(label + ': ' + field.value.trim());
                    }
                });
                Object.keys(groups).forEach(function (label) {
                    var g = groups[label];
                    lines.push(label + ': ' + (g.sim.length ? g.sim.join(', ') : 'nenhum dos itens'));
                    if (g.nao.length) lines.push('Ainda não tem: ' + g.nao.join(', '));
                });
                var url = whatsappLink(lines.join('\n'));
                var win = window.open(url, '_blank', 'noopener');
                if (!win) window.location.href = url;
            });
        });
    }

    // ---------- Aviso de cookies ----------
    // Faixa compacta no rodapé da tela, para não cobrir os botões principais.
    // Aceitar e recusar têm o mesmo destaque. O Analytics só carrega depois de "Aceitar" (ver head.js).
    function fecharAvisoCookies() {
        var aviso = document.getElementById('aviso-cookies');
        if (aviso) aviso.remove();
        document.body.classList.remove('com-aviso-cookies');
        document.body.style.removeProperty('--aviso-cookies-altura');
    }
    function ajustarAlturaAviso() {
        var aviso = document.getElementById('aviso-cookies');
        if (aviso) document.body.style.setProperty('--aviso-cookies-altura', aviso.offsetHeight + 'px');
    }
    function abrirAvisoCookies() {
        if (!window.gcConsentimento || document.getElementById('aviso-cookies')) return;
        document.body.insertAdjacentHTML('beforeend',
            '<div id="aviso-cookies" class="aviso-cookies" role="region" aria-label="Aviso de cookies">' +
                '<p class="aviso-cookies-texto">Usamos cookies de análise só com a sua permissão. ' +
                '<a href="/politica-de-privacidade"' + (onLanding ? ' target="_blank" rel="noopener"' : '') + '>Saiba mais</a></p>' +
                '<div class="aviso-cookies-botoes">' +
                    '<button type="button" data-cookies="recusar" class="aviso-cookies-botao aviso-cookies-recusar">Recusar</button>' +
                    '<button type="button" data-cookies="aceitar" class="aviso-cookies-botao aviso-cookies-aceitar">Aceitar</button>' +
                '</div>' +
            '</div>');
        document.body.classList.add('com-aviso-cookies');
        ajustarAlturaAviso();
        document.getElementById('aviso-cookies').addEventListener('click', function (e) {
            var acao = e.target.getAttribute('data-cookies');
            if (!acao) return;
            if (acao === 'aceitar') window.gcConsentimento.aceitar(); else window.gcConsentimento.recusar();
            fecharAvisoCookies();
        });
    }
    window.addEventListener('resize', ajustarAlturaAviso);
    document.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('[data-abrir-cookies]')) abrirAvisoCookies();
    });

    // ---------- Eventos do Google Analytics (só são enviados com consentimento) ----------
    // clique_whatsapp   : qualquer link para o WhatsApp (cta_local diz onde estava o botão)
    // clique_email      : links de e-mail
    // envio_formulario  : formulários das landing pages (cta_opcao traz a opção escolhida)
    // clique_interno    : botões e cards que levam a outra página do site
    // clique_rede_social: Instagram e LinkedIn
    // abrir_faq         : pergunta frequente aberta
    // filtro_blog       : tema escolhido no filtro do blog
    function evento(nome, parametros) { if (window.gcEvento) window.gcEvento(nome, parametros); }

    function localDoElemento(el) {
        if (el.closest('.whatsapp-float')) return 'botao_flutuante';
        if (el.closest('header')) return 'cabecalho';
        if (el.closest('footer')) return 'rodape';
        var secao = el.closest('section');
        if (!secao) return 'pagina';
        var secoes = Array.prototype.slice.call(document.querySelectorAll('main > section'));
        var i = secoes.indexOf(secao);
        if (i === 0) return 'topo';
        if (i === secoes.length - 1) return 'chamada_final';
        return secao.id ? 'secao_' + secao.id : 'secao_' + (i + 1);
    }
    function textoDoElemento(el) {
        return (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100);
    }

    document.addEventListener('click', function (e) {
        var link = e.target.closest ? e.target.closest('a[href]') : null;
        if (!link) return;
        var href = link.getAttribute('href');
        var base = { cta_local: localDoElemento(link), cta_texto: textoDoElemento(link), pagina: location.pathname };
        if (href.indexOf('wa.me') !== -1) {
            evento('clique_whatsapp', base);
        } else if (href.indexOf('mailto:') === 0) {
            evento('clique_email', base);
        } else if (/instagram\.com|linkedin\.com/.test(href)) {
            base.rede = href.indexOf('instagram') !== -1 ? 'instagram' : 'linkedin';
            evento('clique_rede_social', base);
        } else if (/^\/(?!\/)/.test(href) && !link.closest('header nav') && !link.closest('#mobile-menu')) {
            base.destino = href;
            evento('clique_interno', base);
        }
    }, true);

    document.addEventListener('submit', function (e) {
        var form = e.target;
        if (!form.hasAttribute || !form.hasAttribute('data-wa-form')) return;
        // envia só as opções escolhidas em listas (nunca nome, marca ou outros textos digitados)
        var opcoes = Array.prototype.map.call(form.querySelectorAll('select'), function (s) { return s.value; }).filter(Boolean);
        var marcados = form.querySelectorAll('input[type=checkbox]:checked').length;
        evento('envio_formulario', {
            cta_local: localDoElemento(form), pagina: location.pathname,
            cta_opcao: opcoes.join(' | ') || (form.querySelector('input[type=checkbox]') ? marcados + ' itens marcados' : '')
        });
    }, true);

    document.addEventListener('toggle', function (e) {
        if (e.target.tagName === 'DETAILS' && e.target.open) {
            var resumo = e.target.querySelector('summary');
            evento('abrir_faq', { pergunta: resumo ? textoDoElemento(resumo) : '', pagina: location.pathname });
        }
    }, true);

    // ---------- Blog: filtro por tema e paginação ----------
    // Os cards já vêm no HTML (gerados pelo build a partir de artigos.json), para o Google ler todos.
    // Aqui eles só são filtrados por tema e divididos em páginas de 6, sem buscar nada na rede.
    // O tema escolhido fica na URL (/blog?tema=Contratos), para poder ser compartilhado.
    function iniciarBlog(container, paginacao, filtros) {
        var porPagina = 6;
        var cards = Array.prototype.slice.call(container.querySelectorAll('.artigo-card'));
        var chips = filtros ? Array.prototype.slice.call(filtros.querySelectorAll('.blog-chip')) : [];
        var temas = chips.map(function (c) { return c.getAttribute('data-tema'); });
        var pedido = new URLSearchParams(location.search).get('tema') || '';
        var atual = temas.indexOf(pedido) !== -1 ? pedido : '';
        var visiveis = [];

        function mostrarPagina(n, rolar) {
            cards.forEach(function (c) { c.hidden = true; });
            visiveis.slice((n - 1) * porPagina, n * porPagina).forEach(function (c) { c.hidden = false; });
            Array.prototype.forEach.call(paginacao.children, function (btn, i) {
                var ativo = i + 1 === n;
                btn.className = 'blog-pagina' + (ativo ? ' blog-pagina-ativa' : '');
                btn.setAttribute('aria-current', ativo ? 'page' : 'false');
            });
            if (rolar) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function aplicar() {
            visiveis = cards.filter(function (c) { return !atual || c.getAttribute('data-tema') === atual; });
            chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-tema') === atual ? 'true' : 'false'); });
            var paginas = Math.ceil(visiveis.length / porPagina);
            paginacao.innerHTML = '';
            for (var i = 1; paginas > 1 && i <= paginas; i++) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = i;
                btn.setAttribute('aria-label', 'Página ' + i);
                btn.addEventListener('click', mostrarPagina.bind(null, i, true));
                paginacao.appendChild(btn);
            }
            mostrarPagina(1, false);
        }

        if (filtros) {
            filtros.addEventListener('click', function (e) {
                var chip = e.target.closest('.blog-chip');
                if (!chip || chip.getAttribute('data-tema') === atual) return;
                atual = chip.getAttribute('data-tema');
                var url = new URL(location.href);
                if (atual) url.searchParams.set('tema', atual); else url.searchParams.delete('tema');
                history.replaceState(null, '', url);
                evento('filtro_blog', { tema: atual || 'Todos' });
                aplicar();
            });
        }
        aplicar();
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.body.insertAdjacentHTML('beforeend', onLanding ? landingFooter : footer);
        setupWhatsappForms();
        if (window.gcConsentimento && !window.gcConsentimento.valor()) abrirAvisoCookies();

        // Fim dos artigos: lembrete do glossário, logo depois da chamada para a área de atuação
        var ctaArtigo = page === 'article' && document.querySelector('.artigo-cta');
        if (ctaArtigo) {
            ctaArtigo.insertAdjacentHTML('afterend',
                '<p class="artigo-glossario">Ficou com dúvida sobre algum termo? Consulte o <a href="/glossario">Glossário Jurídico para Startups</a>.</p>');
        }

        var lista = document.getElementById('posts-container');
        var paginacao = document.getElementById('pagination-container');
        if (lista && paginacao) iniciarBlog(lista, paginacao, document.getElementById('blog-filtros'));
    });
})();
