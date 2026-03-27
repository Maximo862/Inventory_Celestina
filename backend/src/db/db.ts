import { createPool } from "mysql2/promise";

export const pool = createPool({
    host: "localhost",
    user: "root",
    password: "root08", 
    database: "inventorymadereria"
})
    //  host: process.env.DB_HOST,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
    // port: Number(process.env.DB_PORT),