const request = require('supertest');
const express = require('express');
const session = require('express-session');
const authRoutes = require('../routes/auth');

const app = express();
app.use(express.urlencoded({ extended: true })); // 'extended: true' ermöglicht komplexere Datenstrukturen
app.use(session({
  secret: 'test_secret_key',
  resave: false,
  saveUninitialized: true,
}));
app.use('/auth', authRoutes);

describe('Authentication tests', () => {
  it('should login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .type('form') // Setze den Content-Type Header auf 'application/x-www-form-urlencoded'
      .send({ username: 'user1', password: 'password1' });

    console.log('Response Status:', response.status);
    expect(response.status).toBe(200);
    expect(response.text).toBe('Login successful');
  });

  it('should fail login with invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .type('form') // Setze den Content-Type Header auf 'application/x-www-form-urlencoded'
      .send({ username: 'user1', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.text).toBe('Invalid credentials');
  });

  it('should access protected route after login', async () => {
    const agent = request.agent(app);
    await agent
      .post('/auth/login')
      .type('form') // Setze den Content-Type Header auf 'application/x-www-form-urlencoded'
      .send({ username: 'user1', password: 'password1' });

    const response = await agent.get('/auth/protected');
    console.log('Protected Route Response Status:', response.status);
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello user1, you are authenticated');
  });

  it('should not access protected route without login', async () => {
    const response = await request(app).get('/auth/protected');
    expect(response.status).toBe(401);
    expect(response.text).toBe('You need to log in first');
  });

  it('should logout successfully', async () => {
    const agent = request.agent(app);
    await agent
      .post('/auth/login')
      .type('form') // Setze den Content-Type Header auf 'application/x-www-form-urlencoded'
      .send({ username: 'user1', password: 'password1' });

    const response = await agent.post('/auth/logout');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Logout successful');
  });
});
