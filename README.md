# SOS Server

## Objetivo

Trabalhar em conjunto com o [mitmproxy] para interceptar as chamadas
para o link de compras.

Essa **lista de compras** é processada construindo uma [lista de ids]
 
Construção inicial da lista de ids é  armazenada no **banco de dados**, rota POST /compras.

> Há uma intercepção realizada pelo proxy para retornar mais itens na paginação dessa página específica.

Uma extensão do navegador fará a requisição para GET /proxima-compra que
retornará o id para a próxima navegação no cliente.




## Pré-requisitos

## Mitmproxy

Próximos passos:
1. Colocar os executáveis do mitmproxy  em "/home/bruno/.local/bin/"
2. Gerar Certificado
3. Adicionar certifiaco ao chrome
4. Alterar arquivo hosts adicionado "sosproxy"


### Detalhamento - Passo 2

```bash
mitmproxy
sudo mkdir /usr/local/share/ca-certificates/extra
openssl x509 -in ~/.mitmproxy/mitmproxy-ca-cert.pem -inform PEM -out ~/.mitmproxy/mitmproxy-ca-cert.crt
sudo cp ~/.mitmproxy/mitmproxy-ca-cert.crt /usr/local/share/ca-certificates/extra/mitmproxy-ca-cert.crt
sudo update-ca-certificates
```

## Conceitos Importantes

### Estados da Compra

Existem dois estados da compra:
1. [foiProcessado] - indica que o loop feito pela extensão do chrome em todas as compras foi para a página da compra;
2. [foiConfirmado] - ao ir para a página da compra, o captcha não bloqueou o proxy de conseguir interceptar a resposta
   json dos itens, ou seja, foi uma captura bem sucedida.

### Compra Relante

Se a compra que teve seus itens interceptados, tiver algum na fase 'AR' e situação '1', então ela é considerada relevante.

Acredito que a situação se refira a "SituacaoItemCompraEnum":

1. Ativo - ATIVO
2. Cancelado - CANCELADO
3. Anulado  - ANULADO
4. Revogado - REVOGADO
5. Suspenso - SUSPENSO
6. Deserto - DESERTO
* Fracassado
   7. Fracassado na Análise
   8. Fracassado no Julgamento
   9. Fracassado na Disputa
    
Acredito que a fase do item se refira ao ENUM FaseItemEnum:

* AS - Aguardando abertura da sessão pública
* AP - Pendente da análise de propostas
* F - Aguardando disputa
* AA - Aguardando abertura
* LS - Abertura Suspensa
* LA - Etapa aberta
* LF - Etapa fechada
* AL - Etapa aberta (aleatório)
* FE - Aguardando Encerramento
* RA - Aguardando Decisão sobre Reinício
* AF - Aguardando Disputa Fechada
* AM - Aguardando Desempate ME/EPP
* DM - Em Desempate ME/EPP
* A7 - Aguardando Desempate 7174
* D7 - Em Desempate 7174
* DF - Em Disputa final - Art. 60 da Lei 14.133/2021
* B3 - Aguardando Decisão sobre item de cota
* JT - Aguardando julgamento de técnica | técnica e preço
* E - Disputa Encerrada
* JE - Julgamento encerrado
* HE - Habilitação encerrada
* PE - Aguardando encerramento
* PR - Aguardando reabertura
* JR - Julgamento/Habilitação reabertos 
* AR - Aberto para recursos  
* AC - Aberto para contrarrazões 
* D1 - Aguardando decisão de recursos
* D2 - Aguardando revisão de decisão
* AE - Adjudicação encerrada
        
      
## Rotas 

1. POST /compras
2. GET  /compras
3. GET  /progresso
4. GET  /proxima-compra
5. GET  /processar/:id
6. GET  /confirmar/:id
7. GET  /resetar
8. POST /log/:level

## Comandos

Antes de rodar:
1. O chrome deve ter sido configurado com o proxy apontando para sosproxy.
2. Deve-se rodar o mitmproxy com o script intercept.py
   

1 - Para rodar:

```sh
bun run dev
```

abra http://sosproxy:3000







## Mudanças

1. Avaliar usar Postgres, DragonflyDB ou DuckDB no lugar do SQLite;
2. Avaliar usar PrismaJS, nesse caso seria melhor manter Postgres ou SQLite;
3. Colocar medição de tempo total de execução.
