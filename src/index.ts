import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import pino from "pino";
import {logger as h_pino} from "hono-pino";
import { Database } from "bun:sqlite";

const app = new Hono()
const logger = pino({
  level: 'trace'
})


app.use(cors());
app.use(prettyJSON());
// app.use(h_pino())



//------------------------------

interface Compra  {
  numeroUasg: number,
  numero: number,
  modalidade: number,
  ano: number,
  possuiEventoQueImpedeAcaoNaCompra: boolean
}

interface Itens  {
  fase: string,
  situacao: string
}

interface Log {
  path: string,
  message: string
}

class RegistroCompra  {
  id!: string;
  relevante!: boolean;
  foiProcessada!: boolean;
  foiConfirmada!: boolean;
}

/** 
 * Banco de Dados
 * -----------------
 * 
 * Uma compra possui:
 * 1. Chave
 * 2. Relevante, será true quando ao ser processada for marcada como uma compra de interesse
 * 3. Foi processada, se a extensão tentou processar essa compra;
 * 4. Foi confirmada, o proxy conseguiu interceptar a chamada de itens na página, ou seja, hcaptcha não bloqueou.
*/


let db: Database;
(async function initDB(){
  logger.info("[Server][SQLite]: Iniciando")
  db = new Database("mydb.sqlite", { create: true, safeIntegers: false });
  logger.info("[Server][SQLite]: Tabela compras criada")
  db.run("CREATE TABLE IF NOT EXISTS compras (id TEXT PRIMARY KEY, relevante INTEGER, foiProcessada INTEGER, foiConfirmada INTEGER)");
})();


//--------------------------------


/************************************************************************************
 * Inserir todas as compras
 ************************************************************************************/
app.post('/compras', async (c) => {

  const body: Array<Compra> = await c.req.json()
  const filtered = body.filter( c => c.possuiEventoQueImpedeAcaoNaCompra == false)
  
  logger.debug(`[Server] POST /Compras - Compras Recebidas ${body.length}`)
  logger.debug(`[Server] POST /Compras - Compras Filtradas ${filtered.length}`)
  
  const ids = filtered.map( c => {
    return {
      $id: `${c.numeroUasg.toString().padStart(6, '0')}${c.modalidade.toString().padStart(2, '0')}${c.numero.toString().padStart(5, '0')}${c.ano.toString().padStart(4, '0')}`,
      $relevante: false,
      $foiProcessada: false,
      $foiConfirmada: false,
    }
  })
  
  const insert = db.prepare("INSERT OR REPLACE INTO  compras (id, relevante, foiProcessada, foiConfirmada) VALUES ($id, $relevante, $foiProcessada, $foiConfirmada)");
  const insertCompras = db.transaction(compras => {
    for (const compra of compras){
      // console.log(compra)
      insert.run(compra)
    };
    return compras.length;
  });


  const count = insertCompras(ids);

  logger.debug(`[Server][SQlite] POST /Compras - Inserção de ${count} registros na tabela compras`)

  return c.json({
    success: true,
    data: body,
   
  })
})

/************************************************************************************
 * Listar todas as compras
 ************************************************************************************/
app.get('/compras', async (c) => {


  const query = db.query(`SELECT * FROM compras`).as(RegistroCompra);
  const data = query.all()

  logger.debug(`[Server] GET /Compras - recuperando registros da tabela compras`)
  return c.json({
    success: true,
    data: data,
   
  })
})

/************************************************************************************
 * Mostrar progresso
 ************************************************************************************/
app.get('/progresso', async (c) => {


  const query = db.query(`SELECT id FROM compras WHERE relevante = TRUE`).as(RegistroCompra);
  const data = query.all()

  logger.debug(`[Server] GET /progresso - recuperando progresso no processamento de compras`)

  const query_processadas = db.query(`SELECT COUNT(*) AS processadas FROM compras WHERE foiProcessada = TRUE`).as(RegistroCompra);
  const processadas = query_processadas.all()
  
  return c.json({
    success: true,
    processadas: processadas[0], 
    relevantes: data.length,
    data: data
  })
})



/************************************************************************************
 * Retorna próxima compra a ser processada
 ************************************************************************************/
app.get('/compra', async (c) => {


  const query = db.query(`SELECT * FROM compras WHERE foiConfirmada=FALSE`).as(RegistroCompra);
  const data = query.get()

  // Existe registro
  if(data){
    logger.info(`[Server] Próxima compra será ${data?.id}`)
    return c.json({
      error: false,
      proxima_compra: data.id,
    })
  }

  logger.info(`[Server] Não há próxima compra`)
  return c.json({
    error: true,
    proxima_compra: null
  })

})

/************************************************************************************
 * Processar compra
 ************************************************************************************/
app.get('/processar/:id', async (c) => {

  const id = c.req.param('id')
  

  const query = db.query(`UPDATE compras SET foiProcessada = TRUE WHERE id ="${id}"`);
  const data = query.run()


 
  if(data.changes > 0){
    logger.debug(`[Server] Processou compra ${id}`)
    return c.json({
      error: false,
      compra_processada: id,
      
    })
  }

  logger.error(`[Server] Não foi processada compra ${id}`)
  return c.json({
    error: true
  })

})

/************************************************************************************
 * Confirmar compra
 ************************************************************************************/
app.post('/confirmar/:id', async (c) => {

  const id = c.req.param('id')
  const body: Array<Itens> = await c.req.json()

  const hasAR = body.some(item => item.fase == "AR" && item.situacao == "1") ? "TRUE" : "FALSE";
  const query = db.query(`UPDATE compras SET foiConfirmada = TRUE, relevante = ${hasAR} WHERE id = "${id}"`);
  const data = query.run()

  logger.info(`[Server] confirmada compra ${id}`,data)
  //logger.debug(`[Server] Itens :\n${JSON.stringify(body,null,2)}`)
  if(data.changes > 0){
    return c.json({
      error: false,
      compra_confirmada: id,
      relevante: hasAR
    })
  }

  return c.json({
    error: true
  })

})

app.get('/reset/', async (c) => {

  const query = db.query(`UPDATE compras SET foiProcessada = FALSE`);
  const data = query.run()

  logger.info(data)
  if(data.changes > 0){
    return c.json({
      error: false,
      compras_resetadas: data.changes,
      
    })
  }

  return c.json({
    error: true
  })

})


app.post('/log/:level', async (c) => {

  const level = c.req.param('level')
  const body: Log = await c.req.json()
  logger.info(`[${level}] - ${body.path}\n ${body.message}\n`)

  return c.json({
    error: false
  })
})


export default {
  port: process.env['PORT'] || 3000,
  fetch: app.fetch,
  maxRequestBodySize: 1024 * 1024 * 200,
  strict: false
}
