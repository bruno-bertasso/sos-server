# SOS Server

## Objetivo

Trabalhar em conjunto com o mitmproxy para interceptar as chamadas
para o link de compras.

Essa lista de compras é processada construindo uma [lista de ids]

Essa lista de ids é armazenadas no [duckdb], rota POST /compras.

Uma extensão do navegador fará a requisição para GET /proxima-compra que
retornará o id para a próxima navegação no cliente.

```
window.history.pushState("","",url);
window.history.pushState("","",url);
window.history.back();
```


## Requisitos

No Windows:
```bash
winget install DuckDB.cli
```


Para rodar:
```sh
bun run dev
```

abra http://localhost:3000
