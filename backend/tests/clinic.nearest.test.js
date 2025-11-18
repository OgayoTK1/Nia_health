const request = require('supertest');
const app = require('../src/app');

describe('Clinics nearest endpoint', () => {
  test('400 when latitude/longitude are missing', async () => {
    const res = await request(app).get('/api/clinics/nearest');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toMatch(/Latitude and longitude are required/i);
  });

  test('400 when coordinates are invalid', async () => {
    const res = await request(app).get('/api/clinics/nearest').query({ latitude: 'abc', longitude: 'xyz' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toMatch(/Invalid coordinates/i);
  });
});
