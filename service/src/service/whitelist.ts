import type { RowDataPacket } from 'mysql2/promise'
import * as mysql from '../db/mysql'

export async function check(address: string): Promise<boolean> {
  if (!address)
    return false

  const row = await mysql.query('select * from kchatgpt.whitelist where address = ? limit 1;', [address.toLowerCase()]) as RowDataPacket[]

  if (!row.length)
    return false

  return true
}
