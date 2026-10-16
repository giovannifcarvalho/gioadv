"""Executado automaticamente pelo GitHub (.github/workflows/build.yml) depois de gerar o CSS.

1. Carimba em todas as páginas a versão do assets/tailwind.css (calculada a partir do
   conteúdo do arquivo), para o navegador baixar o CSS novo sempre que ele mudar.
2. Gera o sitemap.xml a partir das páginas do site e do artigos.json.

Para rodar à mão: npm run build
"""
import glob, hashlib, json, os, re
from xml.sax.saxutils import escape

DOMINIO = 'https://giovannidecarvalho.adv.br'
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)

# Páginas que não entram no sitemap (além das marcadas com noindex)
FORA_DO_SITEMAP = {'artigo-modelo.html', '404.html'}
# Ordem de importância no sitemap (o restante vem depois, em ordem alfabética)
PRIMEIRAS = ['index.html', 'servicos.html', 'sobre.html', 'blog.html']


def carimbar_versao_css():
    versao = hashlib.sha256(open('assets/tailwind.css', 'rb').read()).hexdigest()[:10]
    alteradas = 0
    for pagina in glob.glob('*.html'):
        texto = open(pagina, encoding='utf-8').read()
        novo = re.sub(r'assets/tailwind\.css(\?v=[^"]*)?"', f'assets/tailwind.css?v={versao}"', texto)
        if novo != texto:
            open(pagina, 'w', encoding='utf-8').write(novo)
            alteradas += 1
    print(f'CSS versão {versao}: {alteradas} página(s) atualizada(s)')


def gerar_sitemap():
    datas = {p['link']: p['date'] for p in json.load(open('artigos.json', encoding='utf-8'))}
    paginas = []
    for pagina in glob.glob('*.html'):
        if pagina in FORA_DO_SITEMAP:
            continue
        texto = open(pagina, encoding='utf-8').read()
        if re.search(r'<meta name="robots" content="[^"]*noindex', texto):
            continue  # redirecionamentos e páginas que não devem ser indexadas
        paginas.append(pagina)

    def ordem(p):
        if p in PRIMEIRAS:
            return (0, PRIMEIRAS.index(p), '')
        if p.startswith('servicos-'):
            return (1, 0, p)
        if p in datas:
            return (2, 0, '9999' if not datas[p] else ''.join(chr(255 - ord(c)) for c in datas[p]))  # mais recentes primeiro
        return (3, 0, p)

    linhas = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for p in sorted(paginas, key=ordem):
        url = DOMINIO + '/' + ('' if p == 'index.html' else p)
        lastmod = f'<lastmod>{datas[p]}</lastmod>' if p in datas else ''
        linhas.append(f'  <url><loc>{escape(url)}</loc>{lastmod}</url>')
    linhas.append('</urlset>')
    open('sitemap.xml', 'w', encoding='utf-8').write('\n'.join(linhas) + '\n')
    print(f'sitemap.xml: {len(paginas)} página(s)')


if __name__ == '__main__':
    carimbar_versao_css()
    gerar_sitemap()
