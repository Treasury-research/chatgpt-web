import request from 'supertest'
import { ethers } from 'ethers';
import app from '../src/app'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

describe('GET /healthcheck', () => {
	it('should return a 200 status code', async () => {
		const response = await request(app).get('/healthcheck');
		expect(response.status).toBe(200);
	})
})


describe('POST /api/web3/challenge', () => {
	it('should return a 200 status code', async () => {
		const response = await request(app).post('/api/web3/challenge')
			.send({ "address": "0xD3420A3be0a1EFc0FBD13e87141c97B2C9AC9dD3" });
		console.log("response.body", response.body);
		expect(response.status).toBe(200);
	})
})

describe('POST /api/web3/login', () => {
	it('should return a 200 status code', async () => {

		const response = await request(app).post('/api/web3/challenge')
			.send({ "address": "0xD3420A3be0a1EFc0FBD13e87141c97B2C9AC9dD3" });

		// Replace with your own private key
		const privateKey = process.env.PRIVATE_KEY

		// Create a new instance of the ethers Wallet class
		const wallet = new ethers.Wallet(privateKey)


		// Sign the message using the wallet
		const signature = await wallet.signMessage(response.body.message)

		console.log(signature)


		const response1 = await request(app).post('/api/web3/login')
			.send({ "address": "0xD3420A3be0a1EFc0FBD13e87141c97B2C9AC9dD3", signature });
		console.log("response1.body", response1.body);
		expect(response.status).toBe(200);
	})
})
