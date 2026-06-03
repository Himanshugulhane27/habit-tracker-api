import './setup';
import request from 'supertest';
import app from '../src/app';

// helper function to register and get token
// we use this in every test that needs auth
const getToken = async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Himanshu',
      email: 'himanshu@gmail.com',
      password: '123456',
    });
  return response.body.data.token;
};

describe('Habit Routes', () => {

  // test 1 - create habit
  it('should create a habit successfully', async () => {
    const token = await getToken();

    const response = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Morning Run',
        description: 'Run 5km',
        frequency: 'daily',
        tags: ['health'],
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.habit.title).toBe('Morning Run');
  });

  // test 2 - get all habits
  it('should get all habits for logged in user', async () => {
    const token = await getToken();

    // create a habit first
    await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Morning Run',
        frequency: 'daily',
      });

    // now get all habits
    const response = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.habits.length).toBe(1);
  });

  // test 3 - track habit
  it('should track a habit for today', async () => {
    const token = await getToken();

    // create habit
    const habitResponse = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Morning Run', frequency: 'daily' });

    const habitId = habitResponse.body.data.habit._id;

    // track it
    const response = await request(app)
      .post(`/api/habits/${habitId}/track`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Habit tracked successfully');
  });

  // test 4 - duplicate tracking
  it('should not track same habit twice today', async () => {
    const token = await getToken();

    const habitResponse = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Morning Run', frequency: 'daily' });

    const habitId = habitResponse.body.data.habit._id;

    // track first time
    await request(app)
      .post(`/api/habits/${habitId}/track`)
      .set('Authorization', `Bearer ${token}`);

    // track second time - should fail
    const response = await request(app)
      .post(`/api/habits/${habitId}/track`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Habit already tracked for today');
  });

  // test 5 - get history
  it('should get 7 day history for a habit', async () => {
    const token = await getToken();

    const habitResponse = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Morning Run', frequency: 'daily' });

    const habitId = habitResponse.body.data.habit._id;

    const response = await request(app)
      .get(`/api/habits/${habitId}/history`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.history.length).toBe(7);
    expect(response.body.data.streak).toBeDefined();
  });

});