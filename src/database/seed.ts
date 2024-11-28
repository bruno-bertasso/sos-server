import { db } from "./db.js";
import * as schema from "./schema.js";

    await db.insert(schema.compras).values([
    {
        id: 1,
        codigoCompra: "0001",
        foiConfirmado: false,
        foiProcessado: false,
        foiRelevante: false
    },
    {
        id: 2,
        codigoCompra: "0002",
        foiConfirmado: false,
        foiProcessado: true,
        foiRelevante: false
    },
    {
        id: 3,
        codigoCompra: "0003",
        foiConfirmado: true,
        foiProcessado: true,
        foiRelevante: false
    },
    {
        id: 4,
        codigoCompra: "0004",
        foiConfirmado: true,
        foiProcessado: true,
        foiRelevante: true
    }


    ]);

console.log(`Banco de dados Semeado.`);