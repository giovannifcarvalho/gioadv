"""Gera, a partir do artigos.json, os trechos de HTML que o Google precisa ler sem JavaScript.

Executado automaticamente pelo GitHub (npm run build), antes de gerar o CSS. Preenche os trechos
entre comentários "<!-- nome:inicio -->" e "<!-- nome:fim -->" (não edite o que está entre eles):

- lista-artigos      blog: todos os artigos, com o card inteiro clicável
- filtros-blog       blog: botões de filtro por tema
- ultimos-artigos    home e Sobre: os 3 artigos mais recentes
- autor              artigos: autor, data de publicação e de atualização
- dados-estruturados-artigo   artigos: dados estruturados (BlogPosting)
- trilha / trilha-schema      trilha de navegação ("Início › Blog › ...") visível e nos dados estruturados

Também cria a versão WebP (mais leve) da capa de cada artigo, se ainda não existir, e passa a usá-la
na página do artigo. Se trocar a capa de um artigo, apague o .webp antigo para ele ser recriado.

Para publicar um artigo novo: crie a página a partir do artigo-modelo.html e adicione o item em artigos.json.

Para rodar à mão: python3 scripts/gerar-listas.py
"""
import glob, html, json, os, re, unicodedata

DOMINIO = 'https://giovannidecarvalho.adv.br'
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)

MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto',
         'setembro', 'outubro', 'novembro', 'dezembro']

# Nome de cada página na trilha de navegação (artigos usam o título de artigos.json)
NOMES = {
    'servicos.html': 'Áreas de atuação',
    'sobre.html': 'Sobre',
    'blog.html': 'Blog',
    'glossario.html': 'Glossário',
    'raio-x.html': 'Raio-X Jurídico da Startup',
    'politica-de-privacidade.html': 'Política de privacidade',
    'servicos-estruturacao-societaria.html': 'Estruturação societária',
    'servicos-contratos-de-tecnologia.html': 'Contratos de tecnologia',
    'servicos-propriedade-intelectual.html': 'Propriedade intelectual',
    'servicos-lgpd-e-protecao-de-dados.html': 'LGPD e proteção de dados',
    'servicos-investimentos-e-ma.html': 'Investimentos e M&A',
    'servicos-consultoria-empresarial.html': 'Consultoria empresarial',
}

e = lambda t: html.escape(t or '', quote=True)


def sem_acento(texto):
    return ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn').lower()


def data_extenso(iso):
    ano, mes, dia = iso.split('-')
    dia = int(dia)
    return f'{"1º" if dia == 1 else dia} de {MESES[int(mes) - 1]} de {ano}'


def url_publica(arquivo):
    return '/' if arquivo == 'index.html' else '/' + arquivo[:-5]


def substituir(texto, nome, conteudo, arquivo):
    padrao = re.compile(r'([ \t]*)<!-- %s:inicio -->.*?<!-- %s:fim -->' % (re.escape(nome), re.escape(nome)), re.S)
    m = padrao.search(texto)
    if not m:
        return texto
    recuo = m.group(1)
    corpo = '\n'.join(recuo + linha if linha else linha for linha in conteudo.split('\n')) if conteudo else ''
    bloco = f'{recuo}<!-- {nome}:inicio -->\n' + (corpo + '\n' if corpo else '') + f'{recuo}<!-- {nome}:fim -->'
    return texto[:m.start()] + bloco + texto[m.end():]


# ---------- Cards de artigos ----------
def imagem_card(post):
    base = post['image'].split('?')[0]
    if base.endswith('.png') and os.path.exists(base.lstrip('/')[:-4] + '.webp'):
        webp = base[:-4] + '.webp'
        return (f'<picture><source srcset="{e(webp)}?v=0" type="image/webp">'
                f'<img src="{e(base)}?v=0" width="1200" height="600" loading="lazy" alt="" class="artigo-card-img"></picture>')
    return f'<img src="{e(base)}?v=0" width="1200" height="600" loading="lazy" alt="" class="artigo-card-img">'


def card(post, tag_titulo):
    return (f'<a href="{e(post["link"])}" class="artigo-card" data-tema="{e(post.get("tema", ""))}">\n'
            f'    {imagem_card(post)}\n'
            f'    <div class="artigo-card-corpo">\n'
            f'        <p class="artigo-card-categoria">{e(post["category"])}</p>\n'
            f'        <{tag_titulo} class="artigo-card-titulo">{e(post["title"])}</{tag_titulo}>\n'
            f'        <span class="artigo-card-ler">Ler artigo <span aria-hidden="true">&rarr;</span></span>\n'
            f'    </div>\n'
            f'</a>')


def filtros(posts):
    temas = sorted({p['tema'] for p in posts if p.get('tema')}, key=sem_acento)
    botoes = ['<button type="button" class="blog-chip" data-tema="" aria-pressed="true">Todos</button>']
    botoes += [f'<button type="button" class="blog-chip" data-tema="{e(t)}" aria-pressed="false">{e(t)}</button>' for t in temas]
    return '\n'.join(botoes)


# ---------- Trilha de navegação ----------
def itens_trilha(arquivo, artigos_por_arquivo):
    if arquivo in artigos_por_arquivo:
        return [('Início', '/'), ('Blog', '/blog'), (artigos_por_arquivo[arquivo]['title'], url_publica(arquivo))]
    if arquivo == 'artigo-modelo.html':
        return [('Início', '/'), ('Blog', '/blog'), ('Título do artigo', url_publica(arquivo))]
    if arquivo.startswith('servicos-') and arquivo in NOMES:
        return [('Início', '/'), ('Áreas de atuação', '/servicos'), (NOMES[arquivo], url_publica(arquivo))]
    if arquivo in NOMES:
        return [('Início', '/'), (NOMES[arquivo], url_publica(arquivo))]
    return None


def trilha_html(itens):
    partes = []
    for i, (nome, url) in enumerate(itens):
        if i == len(itens) - 1:
            partes.append(f'    <li><span aria-current="page">{e(nome)}</span></li>')
        else:
            partes.append(f'    <li><a href="{e(url)}">{e(nome)}</a></li>')
    return '<nav class="trilha" aria-label="Você está em">\n<ol>\n' + '\n'.join(partes) + '\n</ol>\n</nav>'


def trilha_schema(itens):
    dados = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {'@type': 'ListItem', 'position': i + 1, 'name': nome, 'item': DOMINIO + url}
            for i, (nome, url) in enumerate(itens)
        ],
    }
    return '<script type="application/ld+json">\n' + json.dumps(dados, ensure_ascii=False, indent=2) + '\n</script>'


# ---------- Capas em WebP ----------
def gerar_webp_capas(posts):
    try:
        from PIL import Image
    except ImportError:
        print('  aviso: Pillow não está instalado; capas novas ficam só em PNG')
        return
    for p in posts:
        png = p['image'].split('?')[0].lstrip('/')
        webp = png[:-4] + '.webp'
        if png.endswith('.png') and os.path.exists(png) and not os.path.exists(webp):
            Image.open(png).convert('RGB').save(webp, 'WEBP', quality=80, method=6)
            print(f'  capa em WebP criada: {webp}')


def envolver_capa(texto):
    """Na página do artigo, troca a capa em PNG por <picture> com WebP (quando o WebP existe)."""
    if '<source srcset="/assets/capas/' in texto:
        return texto
    def troca(m):
        base, resto = m.group(1), re.sub(r'\s+', ' ', m.group(2)).replace('loading="lazy"', '').strip()
        if not os.path.exists(base.lstrip('/') + '.webp'):
            return m.group(0)
        if 'fetchpriority' not in resto:
            resto += ' fetchpriority="high"'
        return (f'<picture><source srcset="{base}.webp?v=0" type="image/webp">'
                f'<img src="{base}.png?v=0" {resto}></picture>')
    return re.sub(r'<img\s+src="(/assets/capas/[^"?]+)\.png\?v=[^"]*"([^>]*?)/?>', troca, texto, count=1, flags=re.S)


# ---------- Autor e dados estruturados dos artigos ----------
def autor_html(post):
    data = f'Publicado em <time datetime="{post["date"]}">{data_extenso(post["date"])}</time>'
    if post.get('atualizado') and post['atualizado'] != post['date']:
        data += f' · Atualizado em <time datetime="{post["atualizado"]}">{data_extenso(post["atualizado"])}</time>'
    return ('<div class="artigo-autor">\n'
            '    <img src="/assets/giovanni-avatar-96.webp?v=0" width="48" height="48" alt="" class="artigo-autor-foto">\n'
            '    <div>\n'
            '        <p class="artigo-autor-nome">Por <a href="/sobre">Giovanni de Carvalho</a> · Advogado · OAB/MG 243.837</p>\n'
            f'        <p class="artigo-autor-data">{data}</p>\n'
            '    </div>\n'
            '</div>')


def meta(texto, nome, atributo='name'):
    m = re.search(r'<meta %s="%s" content="([^"]*)"' % (atributo, re.escape(nome)), texto)
    return html.unescape(m.group(1)) if m else ''


def artigo_schema(texto, arquivo, post):
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', texto, re.S)
    titulo = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', h1.group(1)))).strip() if h1 else post['title']
    if len(titulo) > 110:
        titulo = titulo[:107].rsplit(' ', 1)[0] + '…'
    url = DOMINIO + url_publica(arquivo)
    dados = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': titulo,
        'description': meta(texto, 'description'),
        'image': meta(texto, 'og:image', 'property'),
        'datePublished': post['date'],
        'dateModified': post.get('atualizado') or post['date'],
        'inLanguage': 'pt-BR',
        'articleSection': post.get('tema') or post['category'],
        'mainEntityOfPage': {'@type': 'WebPage', '@id': url},
        'author': {'@type': 'Person', '@id': DOMINIO + '/#giovanni', 'name': 'Giovanni de Carvalho', 'url': DOMINIO + '/sobre'},
        'publisher': {'@type': 'LegalService', '@id': DOMINIO + '/#escritorio', 'name': 'Giovanni de Carvalho | Advocacia Empresarial',
                      'logo': {'@type': 'ImageObject', 'url': DOMINIO + '/assets/logo.png'}},
    }
    return '<script type="application/ld+json">\n' + json.dumps(dados, ensure_ascii=False, indent=2) + '\n</script>'


def main():
    posts = json.load(open('artigos.json', encoding='utf-8'))
    posts.sort(key=lambda p: p['date'], reverse=True)
    por_arquivo = {p['link'].lstrip('/') + '.html': p for p in posts}
    for arquivo in por_arquivo:
        if not os.path.exists(arquivo):
            raise SystemExit(f'artigos.json aponta para uma página que não existe: {arquivo}')

    gerar_webp_capas(posts)
    alteradas = 0
    for arquivo in sorted(glob.glob('*.html')):
        texto = open(arquivo, encoding='utf-8').read()
        novo = texto
        if arquivo == 'blog.html':
            novo = substituir(novo, 'lista-artigos', '\n'.join(card(p, 'h2') for p in posts), arquivo)
            novo = substituir(novo, 'filtros-blog', filtros(posts), arquivo)
        novo = substituir(novo, 'ultimos-artigos', '\n'.join(card(p, 'h3') for p in posts[:3]), arquivo)
        itens = itens_trilha(arquivo, por_arquivo)
        if itens:
            novo = substituir(novo, 'trilha', trilha_html(itens), arquivo)
            novo = substituir(novo, 'trilha-schema', trilha_schema(itens), arquivo)
        if arquivo in por_arquivo:
            post = por_arquivo[arquivo]
            novo = envolver_capa(novo)
            novo = substituir(novo, 'autor', autor_html(post), arquivo)
            novo = substituir(novo, 'dados-estruturados-artigo', artigo_schema(novo, arquivo, post), arquivo)
        elif arquivo == 'artigo-modelo.html':
            novo = substituir(novo, 'autor', autor_html({'date': '2026-01-01'}), arquivo)
        if novo != texto:
            open(arquivo, 'w', encoding='utf-8').write(novo)
            alteradas += 1
    print(f'listas, trilhas e autores: {alteradas} página(s) atualizada(s), {len(posts)} artigos')


if __name__ == '__main__':
    main()
