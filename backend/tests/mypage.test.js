const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../models');

let accessToken = '';
let userId = null;

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });

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

  // 로그인
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

describe('Mypage API - Delete Account', () => {

  test('Delete account - 200 (with valid token)', async () => {
    const res = await request(app)
      .delete('/api/v1/mypage') // ✅ 수정된 endpoint
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User account deleted successfully.');

    const deletedUser = await User.findByPk(userId);
    expect(deletedUser).toBeNull();
  });

  test('Delete account without token - 401 (Unauthorized)', async () => {
    const res = await request(app)
      .delete('/api/v1/mypage'); // ✅ 수정된 endpoint

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Authorization token is required.');
  });

});
