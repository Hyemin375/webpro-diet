const { Goal } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

exports.setGoal = async (req, res) => {
  try {
    const userId = req.user.useruserId;
 // JWT에서 추출된 사용자 ID

    const {
      calories,
      protein,
      fat,
      carbohydrate,
      sugar,
      cholesterol,
    } = req.body;

    // 입력 유효성 검사
    if (
      !Number.isInteger(calories) || calories <= 0 ||
      !Number.isInteger(protein) || protein < 0 ||
      !Number.isInteger(fat) || fat < 0 ||
      !Number.isInteger(carbohydrate) || carbohydrate < 0 ||
      !Number.isInteger(sugar) || sugar < 0 ||
      !Number.isInteger(cholesterol) || cholesterol < 0
    ) {
      return res.status(400).json({ message: '유효하지 않은 입력 값입니다.' });
    }

    // 목표가 이미 있으면 업데이트, 없으면 생성
    const [goal, created] = await Goal.upsert({
      userId,
      goalCalories: calories,
      goalProtein: protein,
      goalFat: fat,
      goalCarbon: carbohydrate,
      goalSugar: sugar,
      goalChole: cholesterol,
    });

    return res.status(201).json({
      message: 'Nutrition goal created successfully.',
      goal: {
        userId,
        calories,
        protein,
        fat,
        carbohydrate,
        sugar,
        cholesterol,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류 발생' });
  }
};

exports.getGoal = async (req, res) => {
  const userId = req.user.userId;

  try {
    const goal = await Goal.findOne({ where: { userId } });

    if (!goal) {
      return res.status(404).json({
        status: 404,
        message: '아직 목표 설정을 하지 않았습니다. 목표 설정을 진행해주세요.',
        code: 'GOAL_NOT_SET'
      });
    }

    return res.status(200).json({
      goal: {
        userId: goal.userId,
        calories: goal.goalCalories,
        protein: goal.goalProtein,
        fat: goal.goalFat,
        carbohydrate: goal.goalCarbon,
        sugar: goal.goalSugar,
        cholesterol: goal.goalChole,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: '서버 오류가 발생했습니다.',
      code: 'SERVER_ERROR'
    });
  }
};

exports.updateGoal = async (req, res) => {
  const userId = req.user.userId;

  const { calories, protein, fat, carbohydrate, sugar, cholesterol } = req.body;

  // 유효성 검사
  if (
    !Number.isInteger(calories) || calories <= 0 ||
    !Number.isInteger(protein) || protein < 0 ||
    !Number.isInteger(fat) || fat < 0 ||
    !Number.isInteger(carbohydrate) || carbohydrate < 0 ||
    !Number.isInteger(sugar) || sugar < 0 ||
    !Number.isInteger(cholesterol) || cholesterol < 0
  ) {
    return res.status(400).json({ error: '입력 값이 유효하지 않습니다.' });
  }

  try {
    const goal = await Goal.findOne({ where: { userId } });

    if (!goal) {
      return res.status(404).json({
        error: 'No existing goal found. Please set your goal first.'
      });
    }

    // 업데이트
    goal.goalCalories = calories;
    goal.goalProtein = protein;
    goal.goalFat = fat;
    goal.goalCarbon = carbohydrate;
    goal.goalSugar = sugar;
    goal.goalChole = cholesterol;

    await goal.save();

    res.status(200).json({
      message: 'Nutrition goal updated successfully.',
      goal: {
        userId,
        calories,
        protein,
        fat,
        carbohydrate,
        sugar,
        cholesterol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 오류 발생' });
  }
};

exports.deleteGoal = async (req, res) => {
  const userId = req.user.userId;

  try {
    const goal = await Goal.findOne({ where: { userId } });

    if (!goal) {
      return res.status(404).json({ error: 'No nutrition goal found to delete.' });
    }

    await goal.destroy();

    return res.status(200).json({ message: 'Nutrition goal deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 오류 발생' });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.userId;


    const goal = await Goal.findOne({ where: { userId } });
    if (!goal) return res.status(404).json({ message: '목표 없음' });

    const today = dayjs().format('YYYY-MM-DD');
    const sevenDaysAgo = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
    const thirtyDaysAgo = dayjs().subtract(29, 'day').format('YYYY-MM-DD');

    const todayTracking = await Tracking.findOne({ where: { userId, date: today } });
    const todayCalories = todayTracking ? todayTracking.caloriesConsumed : 0;
    const todayPercent = (todayCalories / goal.goalCalories) * 100;

    const last7 = await Tracking.findAll({
      where: { userId, date: { [Op.between]: [sevenDaysAgo, today] } }
    });
    const last30 = await Tracking.findAll({
      where: { userId, date: { [Op.between]: [thirtyDaysAgo, today] } }
    });

    const avg7 = calcAvg(last7, goal.goalCalories);
    const avg30 = calcAvg(last30, goal.goalCalories);

    res.status(200).json({
      date: today,
      today: {
        caloriesConsumed: todayCalories,
        caloriesGoal: goal.goalCalories,
        achievedPercent: parseFloat(todayPercent.toFixed(1))
      },
      summary: {
        last7days: { averageAchievedPercent: avg7 },
        last30days: { averageAchievedPercent: avg30 }
      }
    });

  } catch (err) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};

function calcAvg(trackings, goalCalories) {
  if (!trackings.length) return 0.0;
  const sum = trackings.reduce((acc, t) => acc + (t.caloriesConsumed / goalCalories) * 100, 0);
  return parseFloat((sum / trackings.length).toFixed(1));
}