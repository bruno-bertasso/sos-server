import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { pino } from "pino";
import  {IItens, ILog,  ICompra} from "./common.js" 
import {routes} from './routes.js'
import { db } from "./database/db.js";
import * as schema from "./database/schema.js";
import { sql } from "drizzle-orm";
import { eq, lt, gte, ne } from 'drizzle-orm';

const uri = "mongodb://localhost:27018";

const app = new Hono()

const logger = pino({
  level: 'trace'
})


app.use(cors());
app.use(prettyJSON());

//--------------------------------


/************************************************************************************
 * Inserir todas as compras
 * Contexto:
 * Ao processar todas as comprasm cria-se o início do banco de dados.
 ************************************************************************************/
app.post(routes.compras, async (c) => {

  const body: Array<ICompra> = await c.req.json()
  const filtered = body.filter(c => c.possuiEventoQueImpedeAcaoNaCompra == false)

  logger.debug(`[Server] POST /Compras - Compras Recebidas ${body.length}`)
  logger.debug(`[Server] POST /Compras - Compras Filtradas ${filtered.length}`)

  const comprasDocs = filtered.map(c => {
    return {
      codigoCompra: `${c.numeroUasg.toString().padStart(6, '0')}${c.modalidade.toString().padStart(2, '0')}${c.numero.toString().padStart(5, '0')}${c.ano.toString().padStart(4, '0')}`,
      foiRelevante: false,
      foiProcessada: false,
      foiConfirmada: false    
    }
  })

  try {
    const resultadoInsercao = await db.insert(schema.compras).values(comprasDocs).returning();
    const quantidadeDocumentos = resultadoInsercao.length

    logger.debug(`[Server][MongoDB] POST /Compras - Inserção de ${quantidadeDocumentos} registro na tabela compras`)
    return c.json({
      error: false,
      documentos_inseridos: quantidadeDocumentos,
    })
  }
  catch (e) {
    return c.json({
      error: true,
      error_description: e,
      body: body
    })
  }
})

/************************************************************************************
 * Listar todas as compras
 ************************************************************************************/
app.get(routes.compras, async (c) => {


  const data = await db.select().from(schema.compras)

  logger.debug(`[Server] GET /Compras - recuperando registros da tabela compras`)
  return c.json({
    success: true,
    data: data,

  })
})

/************************************************************************************
 * Mostra Compra
 ************************************************************************************/
app.get(routes.mostrar_compra, async (c) => {


  const codigo_compra = c.req.param('codigo') ?? ""
  const data = await db.select().from(schema.compras).where(eq(schema.compras.codigoCompra, codigo_compra)).limit(1)

  // Existe registro
  if (data.length === 1) {
    logger.info(`[Server] Get Compra ${codigo_compra}`)
    return c.json({
      error: false,
      compra: data[0]
    })
  }

  logger.info(`[Server] Não há próxima compra`)
  return c.json({
    error: true,
    error_description: "Compra não encontrada",
    compra: null
  })

})

/************************************************************************************
 * Mostrar progresso
 ************************************************************************************/
app.get(routes.progresso, async (c) => {



  const compras_relevantes =  await db.$count(schema.compras, eq(schema.compras.foiRelevante, false));
 
  logger.debug(`[Server] GET /progresso - recuperando progresso no processamento de compras`)

  const compras_processadas =  await db.$count(schema.compras, eq(schema.compras.foiProcessado, false));

  return c.json({
    success: true,
    compras_relevantes: compras_relevantes,
    compras_processadas: compras_processadas,
  })
})



/************************************************************************************
 * Se existir, retorna o id da próxima compra que ainda não foi processada da base de dados.
 * Se não retorna o id da próxima compra como null.
 ************************************************************************************/
app.get(routes.proxima_compra, async (c) => {


  
  const data = await db.select().from(schema.compras).where(eq(schema.compras.foiConfirmado, false)).limit(1)

  // Existe registro
  if (data.length == 1) {
    logger.info(`[Server] Próxima compra será ${data[0].id}`)
    return c.json({
      error: false,
      proxima_compra: data[0].codigoCompra,
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
app.get(routes.processar_compra, async (c) => {

  
  const codigo_compra = c.req.param('codigo') ?? ""

  const data = await db.update(schema.compras).set({ foiProcessado: true, processado_em: new Date() }).where(eq(schema.compras.codigoCompra, codigo_compra)).returning();
  


  if (data.length > 0) {
    logger.debug(`[Server] Processou compra ${codigo_compra}`)
    return c.json({
      error: false,
      compra_processada: codigo_compra,
      processado_em: data[0].processado_em

    })
  }

  logger.error(`[Server] Não foi processada compra ${codigo_compra}`)
  return c.json({
    error: true
  })

})

/************************************************************************************
 * Confirmar compra
 ************************************************************************************/
app.post(routes.confirmar_compra, async (c) => {

  const codigo_compra = c.req.param('codigo') ?? ""
  const body: Array<IItens> = await c.req.json()

  const hasAR = body.some(item => item.fase == "AR" && item.situacao == "1") ? true : false;
  const data = await db.update(schema.compras).set({ foiConfirmado: true, foiRelevante: hasAR, confirmado_em: new Date()  }).where(eq(schema.compras.codigoCompra, codigo_compra)).returning();
  

  logger.info(`[Server] confirmada compra ${codigo_compra}`, data)
  //logger.debug(`[Server] Itens :\n${JSON.stringify(body,null,2)}`)
  if (data.length > 0) {
    return c.json({
      error: false,
      compra_confirmada: data[0].codigoCompra,
      relevante: hasAR,
      confirmado_em: data[0].confirmado_em

    })
  }

  return c.json({
    error: true
  })

})



/************************************************************************************
 * Resetar Banco
 ************************************************************************************/
app.get(routes.resetar, async (c) => {



  const compras_deletadas =  await db.delete(schema.compras).returning();
  const metricas_deletadas =  await db.delete(schema.metricas).returning();

 
  logger.debug(`[Server] GET /progresso - recuperando progresso no processamento de compras`)

  

  return c.json({
    success: true,
    compras_relevantes: compras_deletadas.length,
    compras_processadas: metricas_deletadas.length
  })
})



// Log
app.post(routes.log, async (c) => {

  const level = c.req.param('level')
  const body: ILog = await c.req.json()
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
