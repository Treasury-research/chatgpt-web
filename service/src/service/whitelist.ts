import type { RowDataPacket } from 'mysql2/promise'
import * as mysql from '../db/mysql'

export async function check(address: string): Promise<boolean> {
  if (!address)
    return false

  const rowWhitelist = await mysql.query('select * from kchatgpt.whitelist where address = ? limit 1;', [address.toLowerCase()]) as RowDataPacket[]
  const rowNFT = await mysql.query('select * from lens.tp_account where owner = ? limit 1;', [address.toLowerCase()]) as RowDataPacket[]

  if (!rowWhitelist.length && !rowNFT.length)
    return false

  return true
}
