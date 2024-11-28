import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { compras, metricas } from "./schema.js";


const pool = new Pool({
  connectionString: "postgres://postgres:postgres@localhost:5432/test_db",
});

const db = drizzle(pool, {
  schema: {
    compras,
    metricas
  },
});

export { db };