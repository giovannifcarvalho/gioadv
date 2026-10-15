/* Partes comuns do site: cabeçalho, rodapé, menu mobile e listagem de artigos.
   Para mudar um link do menu, o e-mail ou as redes sociais, edite SÓ este arquivo.

   Cada página carrega este script logo depois de abrir o <body>:
       <body class="bg-white text-gray-800" data-page="article">
           <script src="assets/site.js"></script>
   data-page pode ser "home", "blog" ou "article". */

(function () {
    'use strict';

    var page = document.body.getAttribute('data-page') || 'article';
    var onHome = page === 'home';
    var base = onHome ? '' : 'index.html';   // na home, os links de seção não recarregam a página

    var EMAIL = 'giovannifcarvalho@outlook.com';
    var LINKEDIN = 'https://www.linkedin.com/in/giovannidecarvalhoadv/';
    var INSTAGRAM = 'https://www.instagram.com/giovannidecarvalho.adv/';

    var NAV = [
        { label: 'Serviços', href: base + '#services' },
        { label: 'Sobre', href: base + '#about' },
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
            '<div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-200">' + mobileLinks + '</div>' +
        '</header>';

    document.body.insertAdjacentHTML('afterbegin', header);

    var menuButton = document.getElementById('mobile-menu-button');
    var menu = document.getElementById('mobile-menu');
    function setMenu(open) {
        menu.classList.toggle('hidden', !open);
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    menuButton.addEventListener('click', function () { setMenu(menu.classList.contains('hidden')); });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });

    // ---------- Rodapé ----------
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
            '<div class="mt-8 border-t border-gray-800 pt-8 text-gray-500"><p>&copy; ' + new Date().getFullYear() + ' Giovanni de Carvalho. Todos os direitos reservados.</p></div>' +
        '</div></footer>';

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

    function renderBlog(container, pagination) {
        var perPage = 6;
        loadPosts().then(function (posts) {
            var pageCount = Math.ceil(posts.length / perPage);

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
            show(1, false);
        }).catch(function () {
            container.innerHTML = errorHtml('Tente novamente em instantes.');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.body.insertAdjacentHTML('beforeend', footer);

        var latest = document.getElementById('latest-posts-container');
        if (latest) renderLatest(latest);

        var all = document.getElementById('posts-container');
        if (all) renderBlog(all, document.getElementById('pagination-container'));
    });
})();
