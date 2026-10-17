/* Partes comuns do site: cabeçalho, rodapé, menu mobile e listagem de artigos.
   Para mudar um link do menu, o e-mail ou as redes sociais, edite SÓ este arquivo.

   Cada página carrega este script logo depois de abrir o <body>:
       <body class="bg-white text-gray-800" data-page="article">
           <script src="assets/site.js?v=2026-10-16b"></script>
   data-page pode ser "home", "blog", "article", "servicos", "sobre", "legal", "glossario" ou "landing".

   Landing pages (data-page="landing"): cabeçalho só com o logo e um botão de contato,
   sem menu, e rodapé enxuto, para o visitante não sair da página.
   data-wa-message no <body> define a mensagem do WhatsApp daquela página.

   IMPORTANTE: o "?v=..." força o navegador a baixar a versão nova do arquivo.
   Sempre que este arquivo, head.js ou site.css mudarem, troque o valor de v
   em TODAS as páginas (é o mesmo texto em todas, dá para usar localizar e substituir). */

(function () {
    'use strict';

    var page = document.body.getAttribute('data-page') || 'article';
    var onHome = page === 'home';
    var base = onHome ? '' : 'index.html';   // na home, o link de Contato não recarrega a página

    var EMAIL = 'giovannifcarvalho@outlook.com';
    var LINKEDIN = 'https://www.linkedin.com/in/giovannidecarvalhoadv/';
    var INSTAGRAM = 'https://www.instagram.com/giovannidecarvalho.adv/';
    // Mesmo destino e mensagem do botão "Conversar sobre a minha empresa" da home.
    // Uma página pode trocar a mensagem com data-wa-message no <body>.
    var WA_NUMBER = '5531991466737';
    function whatsappLink(message) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message); }
    var WHATSAPP = whatsappLink(document.body.getAttribute('data-wa-message') ||
        'Olá, Giovanni! Vi o seu site e gostaria de conversar sobre a minha empresa.');
    var onLanding = page === 'landing';

    var NAV = [
        { label: 'Serviços', href: 'servicos.html', active: page === 'servicos' },
        { label: 'Raio-X', href: 'raio-x.html', active: false },
        { label: 'Glossário', href: 'glossario.html', active: page === 'glossario' },
        { label: 'Sobre', href: 'sobre.html', active: page === 'sobre' },
        { label: 'Blog', href: 'blog.html', active: page === 'blog' || page === 'article' }
    ];
    var CONTATO = base + '#contact';

    // ---------- Cabeçalho (inserido na hora, antes do conteúdo, sem "piscar") ----------
    var desktopLinks = NAV.map(function (item) {
        var cls = item.active ? 'text-brand-gold font-bold' : 'text-gray-600 hover:text-brand-gold';
        return '<a href="' + item.href + '" class="' + cls + ' transition duration-300">' + item.label + '</a>';
    }).join('');
    var mobileLinks = NAV.concat([{ label: 'Contato', href: CONTATO }]).map(function (item) {
        return '<a href="' + item.href + '" class="block text-center text-gray-700 py-3 px-4 hover:bg-gray-50">' + item.label + '</a>';
    }).join('');

    var header =
        '<header class="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">' +
            '<div class="container mx-auto px-6 py-3 flex justify-between items-center">' +
                '<a href="index.html" class="shrink-0"><img src="assets/logo.png" alt="Logo Giovanni de Carvalho Advocacia" class="h-12 md:h-14"></a>' +
                '<nav class="hidden md:flex space-x-8 items-center text-sm font-medium">' +
                    desktopLinks +
                    '<a href="' + CONTATO + '" class="bg-brand-gold text-white px-5 py-2 rounded-md hover:opacity-90 transition duration-300">Contato</a>' +
                '</nav>' +
                '<button id="mobile-menu-button" type="button" class="md:hidden text-brand-green p-2" aria-label="Abrir menu" aria-controls="mobile-menu" aria-expanded="false">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>' +
                '</button>' +
            '</div>' +
            // posicionado sobre o conteúdo (absolute), para não empurrar a página para baixo ao abrir
            '<div id="mobile-menu" class="hidden md:hidden absolute left-0 right-0 top-full bg-white border-t border-gray-200 shadow-lg">' + mobileLinks + '</div>' +
        '</header>';

    // Landing page: sem menu, só o logo (que leva à home) e um botão de contato
    var landingHeader =
        '<header class="bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">' +
            '<div class="container mx-auto px-5 md:px-6 py-2.5 flex justify-between items-center gap-4">' +
                '<a href="index.html" class="shrink-0" aria-label="Ir para a página inicial"><img src="assets/logo.png" alt="Giovanni de Carvalho Advocacia" class="h-10 md:h-12"></a>' +
                '<a href="' + WHATSAPP + '" target="_blank" rel="noopener noreferrer" class="bg-brand-gold text-white text-sm md:text-base font-semibold px-4 md:px-5 py-2 rounded-md hover:opacity-90 transition duration-300">Fale comigo</a>' +
            '</div>' +
        '</header>';

    document.body.insertAdjacentHTML('afterbegin', onLanding ? landingHeader : header);

    if (!onLanding) {
    var menuButton = document.getElementById('mobile-menu-button');
    var menu = document.getElementById('mobile-menu');
    function setMenu(open) {
        menu.classList.toggle('hidden', !open);
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
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
        '<p class="mt-3 text-sm text-gray-500">' +
            '<a href="politica-de-privacidade.html"' + (onLanding ? ' target="_blank" rel="noopener"' : '') + ' class="hover:text-brand-gold underline-offset-2 hover:underline">Política de privacidade</a>' +
            ' · <button type="button" data-abrir-cookies class="hover:text-brand-gold underline-offset-2 hover:underline">Preferências de cookies</button>' +
        '</p>';

    var footer =
        '<footer class="bg-gray-900 text-white"><div class="container mx-auto px-6 py-12 text-center">' +
            '<h4 class="text-2xl font-semibold mb-4">Giovanni de Carvalho | Advocacia Empresarial</h4>' +
            '<p class="text-gray-400 mb-2">E-mail: ' + EMAIL + '</p>' +
            '<p class="text-gray-400 mb-6">Atendimento online para todo o Brasil.</p>' +
            '<div class="flex justify-center space-x-6 mb-8">' +
                '<a href="' + LINKEDIN + '" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="text-gray-400 hover:text-brand-gold transition duration-300">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.5-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>' +
                '</a>' +
                '<a href="' + INSTAGRAM + '" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="text-gray-400 hover:text-brand-gold transition duration-300">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.203-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.251-.148-4.771-1.691-4.919-4.919-.058-1.265-.068-1.644-.068-4.849 0-3.204.012-3.584.069-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.21-6.78 2.618-6.99 6.985-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.947.21 4.358 2.618 6.78 6.985 6.989 1.28.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.947-.072 4.354-.21 6.782-2.618 6.989-6.985.058-1.281.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.21-4.359-2.627-6.78-6.989-6.989-1.28-.058-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4c0 2.21-1.791 4-4 4zm6.47-11.272c0-.528.43-1.078 1.078-1.078.601 0 1.079.516 1.079 1.078 0 .522-.445 1.078-1.079 1.078-.648 0-1.078-.555-1.078-1.078z"/></svg>' +
                '</a>' +
            '</div>' +
            '<div class="mt-8 border-t border-gray-800 pt-8 text-gray-500"><p>&copy; ' + new Date().getFullYear() + ' Giovanni de Carvalho. Todos os direitos reservados.</p>' + LINKS_LEGAIS + '</div>' +
        '</div></footer>';

    // Rodapé das landing pages: identificação e contato, sem links para outras páginas
    var landingFooter =
        '<footer class="bg-gray-900 text-white"><div class="container mx-auto px-6 py-10 text-center text-sm">' +
            '<p class="text-xl font-semibold mb-2" style="font-family: \'Cormorant Garamond\', serif;">Giovanni de Carvalho | Advocacia Empresarial</p>' +
            '<p class="text-gray-400">OAB/MG 243.837 · ' + EMAIL + ' · Atendimento online para todo o Brasil</p>' +
            '<p class="text-gray-500 mt-4">&copy; ' + new Date().getFullYear() + ' Giovanni de Carvalho. Todos os direitos reservados.</p>' + LINKS_LEGAIS +
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
            '<div id="aviso-cookies" class="aviso-cookies" role="dialog" aria-live="polite" aria-label="Aviso de cookies">' +
                '<p class="aviso-cookies-texto">Usamos cookies de análise (Google Analytics) para entender como o site é usado e melhorá-lo. ' +
                'Eles só são ativados se você aceitar. Saiba mais na <a href="politica-de-privacidade.html"' + (onLanding ? ' target="_blank" rel="noopener"' : '') + '>Política de privacidade</a>.</p>' +
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
    // envio_formulario  : formulários das landing pages (cta_opcao traz a opção escolhida)
    // clique_interno    : botões e cards que levam a outra página do site
    // clique_rede_social: Instagram e LinkedIn
    // abrir_faq         : pergunta frequente aberta
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
        } else if (/instagram\.com|linkedin\.com/.test(href)) {
            base.rede = href.indexOf('instagram') !== -1 ? 'instagram' : 'linkedin';
            evento('clique_rede_social', base);
        } else if (/\.html(#.*)?$/.test(href) && !link.closest('header nav') && !link.closest('#mobile-menu')) {
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

    // ---------- Listagem de artigos (home e blog) ----------
    // Os artigos vêm de artigos.json: para publicar um novo, basta adicionar um item lá.
    function escapeHtml(text) {
        return String(text == null ? '' : text).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function cardHtml(post) {
        return '<div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition duration-300">' +
                '<img src="' + escapeHtml(post.image) + '" class="w-full h-48 object-cover" alt="' + escapeHtml(post.title) + '" loading="lazy">' +
                '<div class="p-6">' +
                    '<p class="text-sm text-gray-500 mb-2">' + escapeHtml(post.category) + '</p>' +
                    '<h3 class="text-xl font-semibold text-brand-green mb-3">' + escapeHtml(post.title) + '</h3>' +
                    '<a href="' + escapeHtml(post.link) + '" class="font-bold text-brand-gold hover:underline">Leia Mais &rarr;</a>' +
                '</div>' +
            '</div>';
    }

    function loadPosts() {
        return fetch('artigos.json', { cache: 'no-cache' })
            .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(function (posts) {
                // Mais recente primeiro (datas no formato AAAA-MM-DD)
                return posts.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
            });
    }

    function errorHtml(extra) {
        return '<p class="text-center text-gray-500 col-span-full">Não foi possível carregar os artigos agora. ' + extra + '</p>';
    }

    function renderLatest(container) {
        loadPosts().then(function (posts) {
            container.innerHTML = posts.slice(0, 3).map(cardHtml).join('');
        }).catch(function () {
            container.innerHTML = errorHtml('<a href="blog.html" class="text-brand-gold font-bold">Acesse o blog</a>.');
        });
    }

    // Artigos relacionados nas páginas de serviço: <div id="related-posts" data-links="a.html,b.html">
    function renderRelated(container) {
        var links = (container.getAttribute('data-links') || '').split(',').map(function (l) { return l.trim(); });
        var section = container.closest('section') || container;
        loadPosts().then(function (posts) {
            var related = posts.filter(function (p) { return links.indexOf(p.link) !== -1; }).slice(0, 3);
            if (!related.length) { section.style.display = 'none'; return; }
            container.innerHTML = related.map(cardHtml).join('');
        }).catch(function () { section.style.display = 'none'; });
    }

    // Blog: filtro por tema (campo "tema" em artigos.json) + paginação de 6 em 6.
    // O tema escolhido fica na URL (blog.html?tema=Contratos), para poder ser compartilhado.
    function renderBlog(container, pagination) {
        var perPage = 6;
        var filtros = document.getElementById('blog-filtros');
        loadPosts().then(function (todos) {
            var temas = [];
            todos.forEach(function (p) { if (p.tema && temas.indexOf(p.tema) === -1) temas.push(p.tema); });
            temas.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });

            var params = new URLSearchParams(location.search);
            var atual = temas.indexOf(params.get('tema')) !== -1 ? params.get('tema') : '';
            var posts = [];

            function classeChip(ativo) {
                return 'shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm border transition-colors ' +
                    (ativo ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-gold hover:text-brand-green');
            }

            function desenharFiltros() {
                if (!filtros) return;
                filtros.innerHTML = [''].concat(temas).map(function (t) {
                    return '<button type="button" data-tema="' + escapeHtml(t) + '" aria-pressed="' + (t === atual) + '" class="' + classeChip(t === atual) + '">' +
                        escapeHtml(t || 'Todos') + '</button>';
                }).join('');
            }

            function show(n, scroll) {
                container.innerHTML = posts.slice((n - 1) * perPage, n * perPage).map(cardHtml).join('');
                Array.prototype.forEach.call(pagination.children, function (btn, i) {
                    var active = i + 1 === n;
                    btn.className = 'px-4 py-2 rounded-md transition-colors ' +
                        (active ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-700 hover:bg-brand-gold hover:text-white');
                    btn.setAttribute('aria-current', active ? 'page' : 'false');
                });
                if (scroll) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            function aplicar(scroll) {
                posts = atual ? todos.filter(function (p) { return p.tema === atual; }) : todos;
                var pageCount = Math.ceil(posts.length / perPage);
                pagination.innerHTML = '';
                if (pageCount > 1) {
                    for (var i = 1; i <= pageCount; i++) {
                        var btn = document.createElement('button');
                        btn.type = 'button';
                        btn.textContent = i;
                        btn.addEventListener('click', show.bind(null, i, true));
                        pagination.appendChild(btn);
                    }
                }
                desenharFiltros();
                show(1, scroll);
            }

            if (filtros) {
                filtros.addEventListener('click', function (e) {
                    var chip = e.target.closest('button[data-tema]');
                    if (!chip || chip.getAttribute('data-tema') === atual) return;
                    atual = chip.getAttribute('data-tema');
                    var url = new URL(location.href);
                    if (atual) url.searchParams.set('tema', atual); else url.searchParams.delete('tema');
                    history.replaceState(null, '', url);
                    if (window.gcEvento) gcEvento('filtro_blog', { tema: atual || 'Todos' });
                    aplicar(false);
                });
            }
            aplicar(false);
        }).catch(function () {
            container.innerHTML = errorHtml('Tente novamente em instantes.');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.body.insertAdjacentHTML('beforeend', onLanding ? landingFooter : footer);
        setupWhatsappForms();
        if (window.gcConsentimento && !window.gcConsentimento.valor()) abrirAvisoCookies();

        // Fim dos artigos: lembrete do glossário, logo depois da chamada para a área de atuação
        var ctaArtigo = page === 'article' && document.querySelector('.artigo-cta');
        if (ctaArtigo) {
            ctaArtigo.insertAdjacentHTML('afterend',
                '<p class="artigo-glossario">Ficou com dúvida sobre algum termo? Consulte o <a href="glossario.html">Glossário Jurídico para Startups</a>.</p>');
        }

        var latest = document.getElementById('latest-posts-container');
        if (latest) renderLatest(latest);

        var related = document.getElementById('related-posts');
        if (related) renderRelated(related);

        var all = document.getElementById('posts-container');
        if (all) renderBlog(all, document.getElementById('pagination-container'));
    });
})();
