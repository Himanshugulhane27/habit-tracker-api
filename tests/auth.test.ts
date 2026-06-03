import './setup';
import request from 'supertest';
import app from '../src/app';

// describe groups related tests together
describe('Auth Routes', () => {

  // test 1 - register
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Himanshu',
        email: 'himanshu@gmail.com',
        password: '123456',
      });

    // expect means "I expect this to be true"
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.data.token).toBeDefined(); // token exists
  });

  // test 2 - duplicate email
  it('should not register with same email twice', async () => {
    // register first time
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Himanshu',
        email: 'himanshu@gmail.com',
        password: '123456',
      });

    // register second time with same email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Himanshu',
        email: 'himanshu@gmail.com',
        password: '123456',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Email already registered');
  });

  // test 3 - login success
  it('should login successfully with correct credentials', async () => {
    // first register
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Himanshu',
        email: 'himanshu@gmail.com',
        password: '123456',
      });

    // then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'himanshu@gmail.com',
        password: '123456',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  // test 4 - wrong password
  it('should not login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Himanshu',
        email: 'himanshu@gmail.com',
        password: '123456',
      });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'himanshu@gmail.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email or password');
  });

  // test 5 - no token
  it('should not access protected route without token', async () => {
    const response = await request(app).get('/api/habits');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

});