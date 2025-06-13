const request = require('supertest');
const app = require('../app'); // Express 앱 인스턴스를 export 해야 함
const { sequelize, User } = require('../models');

let accessToken = '';
let userId = null;

beforeAll(async () => {
  await sequelize.sync({ force: true }); // 테스트 DB 초기화

  // 회원가입
  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      userLoginId: 'testuser1',
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
      userLoginId: 'testuser1',
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
        userLoginId: 'testuser1',
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
        userLoginId: 'testuser1',
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
        userLoginId: 'testuser1',
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

  test('Delete account - 200', async () => {
    const res = await request(app)
      .delete('/api/v1/auth/delete')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User account deleted successfully.');

    const deletedUser = await User.findByPk(userId);
    expect(deletedUser).toBeNull();
  });

  test('Delete account without token - 401', async () => {
    const res = await request(app)
      .delete('/api/v1/auth/delete');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('인증 토큰이 필요합니다.');
  });
});
