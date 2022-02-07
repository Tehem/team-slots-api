import request from 'supertest';
import app from '../src/app';

describe('App routes', () => {
  it('returns 200 when app is alive', async () => {
    const response = await request(app).get('/healthcheck');

    expect(response.status).toBe(200);
  });

  it('returns 404 when app is alive but route does not exists', async () => {
    const response = await request(app).get('/pong');

    expect(response.status).toBe(404);
  });
});
