"""Executado automaticamente pelo GitHub (.github/workflows/build.yml) no fim do build.

1. Carimba a versão de todos os arquivos de assets/ referenciados com "?v=" (CSS, JavaScript e
   imagens), calculada a partir do conteúdo de cada arquivo. Assim o navegador baixa a versão nova
   sempre que um arquivo muda, e ninguém precisa trocar números à mão.
2. Gera o sitemap.xml a partir das páginas do site e das datas do artigos.json.
3. Grava o versao.json, uma impressão digital do site publicado. A automação usa esse arquivo para
   saber quando a nova versão já está no ar antes de limpar o cache do Cloudflare.

Para rodar à mão: npm run build
"""
import glob, hashlib, json, os, re
from xml.sax.saxutils import escape

DOMINIO = 'https://giovannidecarvalho.adv.br'
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)

# Páginas que não entram no sitemap (além das marcadas com noindex)
FORA_DO_SITEMAP = {'artigo-modelo.html', '404.html'}
# Ordem de importância no sitemap (o restante vem depois)
PRIMEIRAS = ['index.html', 'servicos.html', 'raio-x.html', 'glossario.html', 'sobre.html', 'blog.html']
# O que não faz parte do site publicado (não entra na impressão digital)
FORA_DA_PUBLICACAO = {'.git', 'node_modules', '.github', 'scripts', 'package.json', 'package-lock.json',
                      'tailwind.config.js', '.gitignore', 'versao.json'}

REFERENCIA = re.compile(r'(/assets/[\w./-]+?\.(?:css|js|png|jpe?g|webp|svg|ico))\?v=[\w.-]*')


def hash_arquivo(caminho):
    return hashlib.sha256(open(caminho, 'rb').read()).hexdigest()[:10]


def carimbar(texto):
    def troca(m):
        caminho = m.group(1).lstrip('/')
        if not os.path.exists(caminho):
            print(f'  aviso: arquivo referenciado não existe: {m.group(1)}')
            return m.group(0)
        return f'{m.group(1)}?v={hash_arquivo(caminho)}'
    return REFERENCIA.sub(troca, texto)


def carimbar_versoes():
    # primeiro as referências dentro do JS e do CSS (ex.: o logo no site.js), depois as páginas
    for arquivo in sorted(glob.glob('assets/*.js') + glob.glob('assets/*.css')):
        texto = open(arquivo, encoding='utf-8').read()
        novo = carimbar(texto)
        if novo != texto:
            open(arquivo, 'w', encoding='utf-8').write(novo)
    alteradas = 0
    for pagina in sorted(glob.glob('*.html')):
        texto = open(pagina, encoding='utf-8').read()
        novo = carimbar(texto)
        if novo != texto:
            open(pagina, 'w', encoding='utf-8').write(novo)
            alteradas += 1
    print(f'versões dos arquivos: {alteradas} página(s) atualizada(s)')


def gerar_sitemap():
    datas = {}
    for p in json.load(open('artigos.json', encoding='utf-8')):
        datas[p['link'].lstrip('/') + '.html'] = max(p['date'], p.get('atualizado') or p['date'])
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
            return (2, 0, ''.join(chr(255 - ord(c)) for c in datas[p]))  # mais recentes primeiro
        return (3, 0, p)

    linhas = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for p in sorted(paginas, key=ordem):
        url = DOMINIO + ('/' if p == 'index.html' else '/' + p[:-5])   # endereços sem .html, como o Cloudflare Pages serve
        lastmod = f'<lastmod>{datas[p]}</lastmod>' if p in datas else ''
        linhas.append(f'  <url><loc>{escape(url)}</loc>{lastmod}</url>')
    linhas.append('</urlset>')
    open('sitemap.xml', 'w', encoding='utf-8').write('\n'.join(linhas) + '\n')
    print(f'sitemap.xml: {len(paginas)} página(s)')


def gravar_versao():
    h = hashlib.sha256()
    for pasta, subpastas, arquivos in os.walk('.'):
        subpastas[:] = sorted(d for d in subpastas if d not in FORA_DA_PUBLICACAO)
        for nome in sorted(arquivos):
            caminho = os.path.join(pasta, nome)[2:]
            if caminho in FORA_DA_PUBLICACAO or caminho == 'assets/tailwind.src.css':
                continue
            h.update(caminho.encode('utf-8'))
            h.update(open(caminho, 'rb').read())
    versao = h.hexdigest()[:16]
    json.dump({'versao': versao}, open('versao.json', 'w', encoding='utf-8'))
    open('versao.json', 'a').write('\n')
    print(f'versao.json: {versao}')


if __name__ == '__main__':
    carimbar_versoes()
    gerar_sitemap()
    gravar_versao()
