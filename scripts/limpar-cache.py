"""Limpa o cache do Cloudflare depois que a nova versão do site entra no ar.

Executado pela automação do GitHub (.github/workflows/build.yml) a cada publicação.

O Cloudflare Pages já renova o próprio cache a cada deploy. Esta etapa é uma garantia extra para
quando houver regras de cache no domínio (Caching / Cache Rules), que podem guardar páginas antigas.

Só roda se estes dois segredos estiverem cadastrados no GitHub
(Settings > Secrets and variables > Actions):
  CLOUDFLARE_API_TOKEN  token com a permissão "Zone > Cache Purge > Purge" para o domínio
  CLOUDFLARE_ZONE_ID    identificador da zona (painel do domínio no Cloudflare, coluna "API")

Como funciona: espera o versao.json publicado ficar igual ao gerado neste build (sinal de que o
Cloudflare Pages terminou o deploy) e então pede a limpeza completa do cache da zona.
"""
import json, os, sys, time, urllib.error, urllib.request

SITE = os.environ.get('SITE_URL', 'https://giovannidecarvalho.adv.br').rstrip('/')
TOKEN = os.environ.get('CLOUDFLARE_API_TOKEN', '').strip()
ZONA = os.environ.get('CLOUDFLARE_ZONE_ID', '').strip()
ESPERA_MAXIMA = 10 * 60   # segundos
INTERVALO = 15


def aviso(msg):
    print(f'::notice::{msg}')


def ler_publicado():
    url = f'{SITE}/versao.json?verificacao={int(time.time())}'
    req = urllib.request.Request(url, headers={'Cache-Control': 'no-cache', 'User-Agent': 'gioadv-deploy-check'})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.loads(r.read().decode('utf-8')).get('versao')
    except Exception as erro:   # ainda sem o arquivo, fora do ar por instantes etc.
        print(f'  ainda não disponível ({erro})')
        return None


def main():
    if not TOKEN or not ZONA:
        aviso('Limpeza do cache do Cloudflare não configurada (faltam os segredos CLOUDFLARE_API_TOKEN e CLOUDFLARE_ZONE_ID). Nada a fazer.')
        return 0

    esperado = json.load(open('versao.json', encoding='utf-8'))['versao']
    print(f'Esperando a versão {esperado} entrar no ar em {SITE} ...')
    inicio = time.time()
    while True:
        publicado = ler_publicado()
        if publicado == esperado:
            print(f'Versão no ar depois de {int(time.time() - inicio)} s.')
            break
        if time.time() - inicio > ESPERA_MAXIMA:
            aviso('A nova versão não apareceu em 10 minutos; o cache será limpo mesmo assim.')
            break
        time.sleep(INTERVALO)

    req = urllib.request.Request(
        f'https://api.cloudflare.com/client/v4/zones/{ZONA}/purge_cache',
        data=json.dumps({'purge_everything': True}).encode('utf-8'),
        headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'},
        method='POST')
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            resposta = json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as erro:
        resposta = json.loads(erro.read().decode('utf-8') or '{}')
    if not resposta.get('success'):
        print(f'::error::O Cloudflare recusou a limpeza do cache: {resposta.get("errors")}')
        return 1
    print('Cache do Cloudflare limpo.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
