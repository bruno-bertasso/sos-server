import { serial, varchar, boolean, time, date, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

const timestamps = {
  atualizado_em: timestamp('atualizado_em', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
  criado_em: timestamp().defaultNow().notNull(),
}

// Define o schema da tabela 'compras' table usando o Drizzle ORM
export const compras = pgTable("compras", {
  // coluna 'id': Um serial (auto-incrementado) primary key
  id: serial("id").primaryKey(),
  codigoCompra: varchar("codigo_compra").notNull().unique(),
  foiProcessado: boolean("foi_processado").default(false),
  foiConfirmado: boolean("foi_confirmado").default(false),
  foiRelevante: boolean("foi_relevante").default(false),
  processado_em:  timestamp(),
  confirmado_em: timestamp(),
  ...timestamps
  
});

export const metricas = pgTable("metricas", {
  // coluna 'id': Um serial (auto-incrementado) primary key
  id: serial("id").primaryKey(),
  codigoCompra: varchar("codigo_processamento").notNull().unique(),
  comprasProcessadas: boolean("compras_processadas").default(false),
  comprasTotal: boolean("compras_total").default(false),
  dataProcessamento: date("data_processamento"),
  inicioProcessamento: time("inicio_processamento"),
  fimProcessamento: time("fim_processamento"),
  ...timestamps
});