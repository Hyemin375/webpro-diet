const request = require('supertest');
const app = require('../app');
const { sequelize, Tracking, TrackingDetails, Goal } = require('../models');

jest.setTimeout(20000);

let accessToken = '';
let testId = '';
const today = new Date().toISOString().slice(0, 10);

beforeAll(async () => {
  await sequelize.sync({ force: true });

  testId = `calendaruser_${Date.now()}`;

  await request(app)
    .post('/api/v1/auth/register')
    .send({
      userLoginId: testId,
      userPw: 'testpass123',
      userName: 'Calendar Tester',
      userSex: 'male',
      userAge: 25,
      userWeight: 70,
      userHeight: 175
    });

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      userLoginId: testId,
      userPw: 'testpass123'
    });

  accessToken = loginRes.body.accessToken;

  // 목표 칼로리 설정
  await Goal.create({ userId: loginRes.body.userId || 1, goalCalories: 2000 });

  // Tracking + Detail 생성
  const tracking = await Tracking.create({
    userId: loginRes.body.userId || 1,
    date: today,
    totalCalories: 400,
    isSuccess: false
  });

  await TrackingDetails.create({
    trackingId: tracking.trackingId,
    mealtype: 'breakfast',
    foodName: 'banana',
    eatCalories: 400
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Tracking Controller', () => {
  test('Get Tracking by Date - 200', async () => {
    const res = await request(app)
      .get(`/api/v1/tracking/calendar/${today}/details`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.date).toBe(today);
    expect(res.body.data.meals.length).toBeGreaterThan(0);
    expect(res.body.data.meals[0].foodName).toBe('banana');
  });

  test('Get Tracking by Date - Invalid Format - 400', async () => {
    const res = await request(app)
      .get('/api/v1/tracking/calendar/18-06-2025/details')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid date format/);
  });

  test('Get Calendar Tracking - 200', async () => {
    const now = new Date();
    const res = await request(app)
      .get('/api/v1/tracking/calendar')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ year: now.getFullYear(), month: now.getMonth() + 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.yearMonth).toBe(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    );
    expect(Array.isArray(res.body.data.days)).toBe(true);
  });

  test('Get Calendar Tracking - Invalid Month - 400', async () => {
    const res = await request(app)
      .get('/api/v1/tracking/calendar')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ year: 2025, month: 13 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid year or month/);
  });
});
