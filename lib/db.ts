import { Pool } from "pg"

// PostgreSQLへの接続プールを作成
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "tx_demo",
  port: 5432,
})

export { pool }
