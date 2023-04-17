import express from 'express'
import { ethers } from 'ethers'
import * as jwt from 'jsonwebtoken'
import type { RowDataPacket } from 'mysql2/promise'
import type { RequestProps } from './types'
import { chatConfig, chatReplyProcess } from './chatgpt'
import type { ChatMessage } from './chatgpt'
import { authJWT } from './middleware/auth-jwt'
import { limiter } from './middleware/limiter'
import * as mysql from './db/mysql'
import { randomid } from './utils'

const app = express()
const router = express.Router()

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', [authJWT, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', authJWT, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', authJWT, async (req, res) => {
	try {
		res.send({ status: 'Success', message: '', data: { auth: true, model: currentModel() } })
	}
	catch (error) {
		res.send({ status: 'Fail', message: error.message, data: null })
	}
})

/*
router.post('/verify', async (req, res) => {
	try {
		const { token } = req.body as { token: string }
		if (!token)
			throw new Error('Secret key is empty')

		if (process.env.AUTH_SECRET_KEY !== token)
			throw new Error('密钥无效 | Secret key is invalid')

		res.send({ status: 'Success', message: 'Verify successfully', data: null })
	}
	catch (error) {
		res.send({ status: 'Fail', message: error.message, data: null })
	}
})

*/

router.post('/web3/challenge', async (req, res) => {
  try {
    const { address } = req.body as { address: string }

    const uri = req.headers.host
    const version = 1
    const chainId = 137
    const nonce = randomid(16)
    const createdAt = Math.floor(Date.now() / 1000)
    const status = 1
    await mysql.query('INSERT INTO kchatgpt.challenge (address, uri, version, chainId, nonce, createdAt, status) VALUES ( ?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE uri=VALUES(uri), nonce=VALUES(nonce), createdAt=VALUES(createdAt), status=VALUES(status) ; ', [address.toLowerCase(), uri, version, chainId, nonce, createdAt, status])

    const msg = `\n${uri} wants you to sign in with your Ethereum account:\n${address}\n\nSign in with ethereum to lens\n\nURI: ${uri}\nVersion: ${version}\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${createdAt}\n `
    res.send({ status: 'Success', message: msg, data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/web3/login', async (req, res) => {
  try {
    const { address, signature } = req.body as { address: string; signature: string }
    const row = await mysql.query('select * from kchatgpt.challenge where address = ? and status = ? ;', [address.toLowerCase(), 1]) as RowDataPacket[]

    // console.log(!row.length)
    if (!row.length)
      throw new Error('address not found')

    // console.log(row)
    const { uri, version, chainId, nonce, createdAt } = row[0]

    // check createdAt
    if (Math.floor(Date.now() / 1000) - createdAt > 60 * 5)
      throw new Error('Challenge expired')

    // update status to 0
    await mysql.query('UPDATE kchatgpt.challenge SET status = 0 WHERE address = ? ;', [address.toLowerCase()])

    const msg = `\n${uri} wants you to sign in with your Ethereum account:\n${address}\n\nSign in with ethereum to lens\n\nURI: ${uri}\nVersion: ${version}\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${createdAt}\n `

    // ethers.utils
    const verifyAddress = ethers.verifyMessage(
      msg,
      signature,
    )

    if (verifyAddress.toLowerCase() !== address.toLowerCase())
      throw new Error('Signature verification failed')

    const accessToken = jwt.sign(
      {
        address,
        uri,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }, // 7 day
    )
    res.send({ status: 'Success', message: accessToken, data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.get('/healthcheck', async (req, res) => {
  res.send({ status: 'Success', message: 'ok', data: new Date().valueOf() })
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

export default app
