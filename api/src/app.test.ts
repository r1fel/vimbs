import request from 'supertest';
import app from './app';

describe('POST /auth/login', () => {
  describe('email and password included', () => {
    test('should respond successful login with statusCode200, body._id and body.email', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'bodo4@gmail.com',
        password: 'bodo4',
      });
      expect(response.statusCode).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.email).toBeDefined();
    });
  });

  describe('email or password or both missing', () => {
    test('should respond error with a 400 status code', async () => {
      const bodyData = [
        { email: 'bodo4@gmail.com' },
        { password: 'bodo4' },
        {},
      ];
      for (const body of bodyData) {
        const response = await request(app).post('/auth/login').send(body);
        expect(response.statusCode).toBe(400);
      }
    });
  });
});
