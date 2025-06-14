const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../models');

let accessToken = '';
let testId = ' ';
let userId = null;

const API_PREFIX = '/api/v1/mypage';

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  testId = `testuser_${Date.now()}`;

  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      userLoginId: testId,
      userPw: 'testpass123',
      userName: 'Test User',
      userSex: 'female',
      userAge: 25,
      userWeight: 55,
      userHeight: 165
    });

  userId = registerRes.body.user.userId;

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      userLoginId: testId,
      userPw: 'testpass123',
    });

  accessToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Mypage API - Update Account', () => {
  test('Update user info - 200 OK', async () => {
    const res = await request(app)
      .put(`${API_PREFIX}/update`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'jiwon',
        userSex: 'female',
        userAge: 23,
        userWeight: 50,
        userHeight: 162
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User information updated successfully');
    expect(res.body.user).toMatchObject({
      userName: 'jiwon',
      userSex: 'female',
      userAge: 23,
      userWeight: 50,
      userHeight: 162
    });
  });

  test('Update user info without token - 401 Unauthorized', async () => {
    const res = await request(app)
      .put(`${API_PREFIX}/update`)
      .send({
        userName: 'anyone'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Authorization token is required.');
  });
});

describe('Mypage API - Delete Account', () => {
  test('Delete account - 200 (with valid token)', async () => {
    const res = await request(app)
      .delete(`${API_PREFIX}/delete`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User account deleted successfully.');

    const deletedUser = await User.findByPk(userId);
    expect(deletedUser).toBeNull();
  });

  test('Delete account without token - 401 Unauthorized', async () => {
    const res = await request(app)
      .delete(API_PREFIX);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Authorization token is required.');
  });
});
