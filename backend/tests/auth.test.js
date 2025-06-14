const request = require('supertest');
const app = require('../app'); // Express 앱 인스턴스를 export 해야 함
const { sequelize, User } = require('../models');

let accessToken = '';
let testId = ' ';
let userId = null;

beforeAll(async () => {
  await sequelize.authenticate(); // 연결 확인용

  await sequelize.sync({ force: true }); // 테스트 DB 초기화

  testId = `testuser_${Date.now()}`;

  // 회원가입
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

  // 로그인해서 토큰 발급받기
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

describe('Auth API', () => {
  test('Register duplicate user - 409', async () => {
    const res = await request(app)
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

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('User login ID already exists.');
  });

  test('Login with valid credentials - 200', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        userLoginId: testId,
        userPw: 'testpass123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.message).toBe('Login successful');
  });

  test('Login with wrong password - 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        userLoginId: testId,
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
