const { Goal } = require('../models');
const jwt = require('jsonwebtoken');

exports.setGoal = async (req, res) => {
  try {
    const userId = req.user.id; // JWT에서 추출된 사용자 ID

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
