import request from 'supertest'
import app from '../src/app'

describe('GET /healthcheck', () => {
	it('should return a 200 status code', async () => {
		const response = await request(app).get('/healthcheck');
		expect(response.status).toBe(200);
	})
})