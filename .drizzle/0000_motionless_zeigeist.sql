CREATE TABLE IF NOT EXISTS "compras" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo_compra" varchar NOT NULL,
	"foi_processado" boolean DEFAULT false,
	"foi_confirmado" boolean DEFAULT false,
	"foi_relevante" boolean DEFAULT false,
	CONSTRAINT "compras_codigo_compra_unique" UNIQUE("codigo_compra")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "metricas" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo_processamento" varchar NOT NULL,
	"compras_processadas" boolean DEFAULT false,
	"compras_total" boolean DEFAULT false,
	"data_processamento" date,
	"inicio_processamento" time,
	"fim_processamento" time,
	CONSTRAINT "metricas_codigo_processamento_unique" UNIQUE("codigo_processamento")
);
