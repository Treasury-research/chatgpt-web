import mysql from 'mysql2/promise'

export async function query(sql, params) {
  if (!process.env.MYSQL_HOST)
    throw new Error('.env MYSQL_HOST is empty')

  const pool = await mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,

    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
  })

  const [results] = await pool.execute(sql, params)

  return results
}
