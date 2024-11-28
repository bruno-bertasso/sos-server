import requests
import logging
import json
from mitmproxy import http
from mitmproxy.http import Headers
import re

logger = logging.getLogger(__name__)

def api_log(path, message):
    requests.post(f'http://mitmproxy:3000/log/proxy', json = { "path": path, "message": message })

def get_path(full_path):
    return full_path.partition("?")[0]

# Objetivo: alterar a quantidade de itens retornados na compra
def request(flow: http.HTTPFlow):
    path = get_path(flow.request.path)
    if path == "/comprasnet-fase-externa/public/v1/compras":
        api_log("[Interceptado][Request][Compras]", f"{flow.request.path}")
        flow.request.query["tamanhoPagina"] = "14000"


# Objetivos:
# 1. A resposta das compras é enviada para o backend para ser armazenada no banco.
# 2. Ao interceptar resposta de itens, solicitar ao backend que o processamento do item deve ser confirmado.
def response(flow: http.HTTPFlow):
    path = get_path(flow.request.path)
    m = re.match(r'/comprasnet-fase-externa/public/v1/compras/(\d{17})/itens.*', path)

    # Nesse caso, devo guardar todas as compras na base de dados
    if path == "/comprasnet-fase-externa/public/v1/compras":
        data = flow.response.json()
        url = 'http://mitmproxy:3000/compras'
        x = requests.post(url, json = data)
        logger.info(f"[Backend][Response] {url} \n {x.text}")


    # Se foi uma intercepção de itens
    if m != None:
        data = flow.response.json()
        url = f'http://mitmproxy:3000/confirmar/{m.group(1)}'
        api_log("Interceptado][Response][Itens]", f"Compra {m.group(1)}")
        api_response = requests.post(url, json = data)
        #api_log("[Backend][Response]", f"{api_response.text}")