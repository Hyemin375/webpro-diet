const { Goal, Tracking, TrackingDetails } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

exports.setGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
 // JWT에서 추출된 사용자 ID

    const {
      calories,
      protein,
      fat,
      carbohydrate,
      sugar,
      cholesterol,
    } = req.body;

    const validationMessage = validateGoalInput({
      calories,
      protein,
      fat,
      carbohydrate,
      sugar,
      cholesterol
    });

    // 입력 유효성 검사
    const validationError = validateGoalInput(req.body);
    if (validationError) {
      return res.status(400).json({
        status: 400,
        message: validationError,
        code: 'INVALID_INPUT'
      });
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
        cholesterol
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error occurred while setting goal.'});
  }
};

exports.getGoal = async (req, res) => {
  // Check for authenticated user
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized: Missing or invalid token.',
      code: 'UNAUTHORIZED'
    });
  }

  const userId = req.user.userId;

  try {
    const goal = await Goal.findOne({ where: { userId } });

    if (!goal) {
      return res.status(404).json({
        status: 404,
        message: 'No nutrition goal has been set yet. Please create a goal first.',
        code: 'GOAL_NOT_SET'
      });
    }

    const validationError = validateGoalInput({
      calories: goal.goalCalories,
      protein: goal.goalProtein,
      fat: goal.goalFat,
      carbohydrate: goal.goalCarbon,
      sugar: goal.goalSugar,
      cholesterol: goal.goalChole
    });

    if (validationError) {
      return res.status(500).json({
        status: 500,
        message: 'Nutrition goal data is invalid or corrupted. Please update your goal.',
        code: 'GOAL_DATA_INVALID'
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
      message: 'Server error occurred while setting goal.',
      code: 'SERVER_ERROR'
    });
  }
};

exports.updateGoal = async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized: Missing or invalid token.',
      code: 'UNAUTHORIZED'
    });
  }

  const userId = req.user.userId;

  const { calories, 
    protein, 
    fat, 
    carbohydrate, 
    sugar, 
    cholesterol 
  } = req.body;

  // 유효성 검사
  const validationError = validateGoalInput(req.body);
  if (validationError) {
    return res.status(400).json({
      status: 400,
      message: validationError,
      code: 'INVALID_INPUT'
    });
  }


  try {
    const goal = await Goal.findOne({ where: { userId } });

    if (!goal) {
      return res.status(404).json({
        status: 404,
        message: 'No existing nutrition goal found. Please create one first.',
        code: 'GOAL_NOT_FOUND'
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
    res.status(500).json({
      status: 500,
      message: 'Server error occurred while setting goal.',
      code: 'SERVER_ERROR'
    });
  }
};

exports.deleteGoal = async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized: Missing or invalid token.',
      code: 'UNAUTHORIZED'
    });
  }

  const userId = req.user.userId;

  try {
    const goal = await Goal.findOne({ where: { userId } });

    if (!goal) {
      return res.status(404).json({
        status: 404,
        message: 'No nutrition goal found to delete.',
        code: 'GOAL_NOT_FOUND'
      });
    }

    await goal.destroy();

    return res.status(200).json({ 
      status: 200,
      message: 'Nutrition goal deleted successfully.'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: 'Server error occurred while setting goal.',
      code: 'SERVER_ERROR'
    });
  }
};

exports.getProgress = async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized: Missing or invalid token.',
      code: 'UNAUTHORIZED'
    });
  }

  const userId = req.user.userId;

  try {
    const goal = await Goal.findOne({ where: { userId } });

    if (!goal || !goal.goalCalories) {
      return res.status(404).json({
        status: 404,
        message: 'No nutrition goal found. Please set one first.',
        code: 'GOAL_NOT_SET'
      });
    }

    const today = dayjs().format('YYYY-MM-DD');
    const sevenDaysAgo = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
    const thirtyDaysAgo = dayjs().subtract(29, 'day').format('YYYY-MM-DD');

    const todayTracking = await Tracking.findOne({ where: { userId, date: today } });
    const todayCalories = todayTracking ? todayTracking.totalCalories : 0;
    const todayPercent = goal.goalCalories > 0 ? (todayCalories / goal.goalCalories) * 100 : 0;

    const last7 = await Tracking.findAll({
      where: { userId, date: { [Op.between]: [sevenDaysAgo, today] } }
    });
    const last30 = await Tracking.findAll({
      where: { userId, date: { [Op.between]: [thirtyDaysAgo, today] } }
    });

    const avg7 = calcAvg(last7, goal.goalCalories);
    const avg30 = calcAvg(last30, goal.goalCalories);

    res.status(200).json({
      status: 200,
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
    console.error(err);
    res.status(500).json({
      status: 500,
      message: 'Server error occurred while calculating progress.',
      code: 'SERVER_ERROR'
    });
  }
};

function calcAvg(trackings, goalCalories) {
  if (!trackings.length || !goalCalories) return 0.0;
  const sum = trackings.reduce((acc, t) => acc + (t.totalCalories/ goalCalories) * 100, 0);
  return parseFloat((sum / trackings.length).toFixed(1));
}

function validateGoalInput(data) {
  const requiredFields = {
    calories: 1,
    protein: 0,
    fat: 0,
    carbohydrate: 0,
    sugar: 0,
    cholesterol: 0
  };

  for (const [field, min] of Object.entries(requiredFields)) {
    const value = data[field];
    if (value !== undefined && (!Number.isInteger(value) || value < min)) {
      return `Invalid input: '${field}' must be an integer ≥ ${min}.`;
    }
  }

  if (!Number.isInteger(data.calories) || data.calories <= 0) {
    return "Calories is required and must be a positive integer.";
  }
  
  return null; // 유효할 경우
}
