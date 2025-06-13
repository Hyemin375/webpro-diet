const request = require('supertest');
const app = require('../app'); // Express 앱 인스턴스를 export 해야 함
const { sequelize, User } = require('../models');

// 테스트 전/후 훅
beforeAll(async () => {
  await sequelize.sync({ force: true }); // 테스트 DB 초기화
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth API', () => {
  const testUser = {
    userLoginId: 'testuser1',
    userPw: 'testpass123',
    userName: 'Test User',
    userSex: 'female',
    userAge: 25,
    userWeight: 55,
    userHeight: 165
  };

  test('Register new user - 201', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.user.userLoginId).toBe(testUser.userLoginId);
  });

  test('Register duplicate user - 409', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('User login ID already exists.');
  });

  test('Login with valid credentials - 200', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        userLoginId: testUser.userLoginId,
        userPw: testUser.userPw
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.message).toBe('Login successful');
  });

  test('Login with wrong password - 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        userLoginId: testUser.userLoginId,
        userPw: 'wrongpass'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  test('Login with missing fields - 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Login ID and password are required.');
  });
});
