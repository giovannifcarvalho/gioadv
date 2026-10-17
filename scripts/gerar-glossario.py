"""Gera o conteúdo do glossario.html a partir do glossario.json.

Executado automaticamente pelo GitHub (npm run build) antes de gerar o CSS. O HTML dos termos
fica escrito na própria página (e não montado pelo navegador) para que o Google leia todos eles.

Na página, o conteúdo gerado fica entre comentários "glossario-...:inicio" e "glossario-...:fim".
Não edite o que está entre eles: edite o glossario.json.

Para rodar à mão: python3 scripts/gerar-glossario.py
"""
import html, json, os, re, unicodedata

DOMINIO = 'https://giovannidecarvalho.adv.br'
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)
PAGINA = 'glossario.html'

e = lambda t: html.escape(t or '', quote=True)


def sem_acento(texto):
    return ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn').lower()


def termo_html(t):
    busca = ' '.join([t['termo']] + t.get('outros_nomes', []) + [t['definicao']])
    partes = [
        f'<article class="gl-termo" id="{e(t["id"])}" data-busca="{e(sem_acento(busca))}">',
        '<div class="gl-termo-topo">',
        f'<h3 class="gl-termo-nome">{e(t["termo"])}</h3>',
        f'<a href="#{e(t["id"])}" class="gl-copiar" data-copiar aria-label="Copiar o link de {e(t["termo"])}" title="Copiar link">'
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M12.6 3.4a3.5 3.5 0 015 5l-2.5 2.5a3.5 3.5 0 01-5 0 1 1 0 011.4-1.4 1.5 1.5 0 002.1 0l2.5-2.5a1.5 1.5 0 00-2.1-2.1l-.8.8a1 1 0 01-1.4-1.4l.8-.9zm-5 5a3.5 3.5 0 015 0 1 1 0 01-1.4 1.4 1.5 1.5 0 00-2.1 0l-2.5 2.5a1.5 1.5 0 002.1 2.1l.8-.8a1 1 0 011.4 1.4l-.8.9a3.5 3.5 0 01-5-5l2.5-2.5z"/></svg>'
        '</a>',
        '</div>',
        f'<p class="gl-definicao">{e(t["definicao"])}</p>',
    ]
    if t.get('pratica'):
        partes.append(f'<p class="gl-pratica"><strong>Na prática:</strong> {e(t["pratica"])}</p>')
    if t.get('artigos'):
        links = ' · '.join(f'<a href="{e(a["link"])}">{e(a["titulo"])}</a>' for a in t['artigos'])
        partes.append(f'<p class="gl-leia"><span>Leia no blog:</span> {links}</p>')
    partes.append('</article>')
    return ''.join(partes)


def area_html(area):
    n = len(area['termos'])
    linhas = [
        f'<section class="gl-area" id="area-{e(area["id"])}" data-area="{e(area["id"])}" aria-labelledby="titulo-{e(area["id"])}">',
        '<div class="gl-area-cabecalho">',
        f'<h2 id="titulo-{e(area["id"])}" class="text-3xl md:text-4xl font-bold text-brand-green">{e(area["nome"])}</h2>',
        f'<span class="gl-area-conta">{n} {"termo" if n == 1 else "termos"}</span>',
        '</div>',
        '<div class="gl-grade">',
    ]
    linhas += [termo_html(t) for t in area['termos']]
    linhas.append('</div>')
    if area.get('landing'):
        linhas.append(f'<a href="{e(area["landing"]["link"])}" class="gl-area-link">Conheça a área de {e(area["landing"]["titulo"])} &rarr;</a>')
    linhas.append('</section>')
    return '\n'.join(linhas)


def filtros_html(areas):
    botoes = ['<button type="button" class="gl-chip" data-area="" aria-pressed="true">Todas</button>']
    botoes += [f'<button type="button" class="gl-chip" data-area="{e(a["id"])}" aria-pressed="false" title="{e(a["nome"])}">{e(a.get("nome_curto") or a["nome"])}</button>' for a in areas]
    return '\n'.join(botoes)


def indice_html(areas):
    todos = sorted((t for a in areas for t in a['termos']), key=lambda t: sem_acento(t['termo']))
    letras = {}
    for t in todos:
        letras.setdefault(sem_acento(t['termo'])[0].upper(), []).append(t)
    blocos = []
    for letra, termos in letras.items():
        itens = ''.join(f'<li><a href="#{e(t["id"])}">{e(t["termo"])}</a></li>' for t in termos)
        blocos.append(f'<div class="gl-indice-bloco"><p class="gl-indice-letra">{letra}</p><ul>{itens}</ul></div>')
    return (f'<details class="gl-indice"><summary>Índice de A a Z <span>({len(todos)} termos)</span></summary>'
            f'<div class="gl-indice-grade">{"".join(blocos)}</div></details>')


def schema_json(areas):
    url = f'{DOMINIO}/glossario'   # endereço público (o Cloudflare Pages serve as páginas sem .html)
    dados = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': url,
        'name': 'Glossário Jurídico para Startups',
        'description': 'Termos jurídicos de sociedade, investimento, contratos, marca, LGPD e equipe, explicados para empreendedores.',
        'inLanguage': 'pt-BR',
        'url': url,
        'author': {'@id': f'{DOMINIO}/#giovanni'},
        'publisher': {'@id': f'{DOMINIO}/#escritorio'},
        'hasDefinedTerm': [
            {'@type': 'DefinedTerm', 'name': t['termo'], 'description': t['definicao'],
             'url': f'{url}#{t["id"]}', 'inDefinedTermSet': url}
            for a in areas for t in a['termos']
        ],
    }
    return ('<script type="application/ld+json">\n'
            + json.dumps(dados, ensure_ascii=False, indent=2).replace('</', '<\\/')
            + '\n    </script>')


def substituir(texto, nome, conteudo):
    padrao = re.compile(r'(<!-- glossario-%s:inicio -->)(.*?)(<!-- glossario-%s:fim -->)' % (nome, nome), re.S)
    if not padrao.search(texto):
        raise SystemExit(f'Marcador "glossario-{nome}" não encontrado em {PAGINA}')
    return padrao.sub(lambda m: m.group(1) + '\n' + conteudo + '\n' + m.group(3), texto, count=1)


def main():
    dados = json.load(open('glossario.json', encoding='utf-8'))
    areas = dados['areas']
    ids = [t['id'] for a in areas for t in a['termos']]
    repetidos = {i for i in ids if ids.count(i) > 1}
    if repetidos:
        raise SystemExit(f'glossario.json: ids repetidos: {", ".join(sorted(repetidos))}')
    for i in ids:
        if not re.fullmatch(r'[a-z0-9-]+', i):
            raise SystemExit(f'glossario.json: id inválido "{i}" (use letras minúsculas, números e hífens)')

    texto = open(PAGINA, encoding='utf-8').read()
    texto = substituir(texto, 'schema', schema_json(areas))
    texto = substituir(texto, 'filtros', filtros_html(areas))
    texto = substituir(texto, 'indice', indice_html(areas))
    texto = substituir(texto, 'termos', '\n'.join(area_html(a) for a in areas))
    texto = re.sub(r'data-total-termos="\d*"', f'data-total-termos="{len(ids)}"', texto)
    open(PAGINA, 'w', encoding='utf-8').write(texto)
    print(f'{PAGINA}: {len(ids)} termos em {len(areas)} áreas')


if __name__ == '__main__':
    main()
