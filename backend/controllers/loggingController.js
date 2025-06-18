const dayjs = require('dayjs');
const { Tracking, TrackingDetails, User, Goal} = require('../models');


exports.logMealByDate = async (req, res) => {
  const userId = req.user.userId;
  const { date } = req.params;
  const {
    mealType,
    food,
    calories,
    protein,
    fat,
    carbohydrate,
    sugar,
    cholesterol
  } = req.body;

  // Validate date format
  if (!dayjs(date, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid date format. Expected YYYY-MM-DD.'
    });
  }

  // Validate required fields
  if (!mealType || !food || calories === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields: mealType, food, or calories.'
    });
  }

  if (!Number.isInteger(calories)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid data type: calories must be an integer.'
    });
  }

  try {
    // ✅ Check user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: `User with userId ${userId} not found.`
      });
    }

    // ✅ Find or create tracking record for the date
    let tracking = await Tracking.findOne({ where: { userId, date } });
    if (!tracking) {
      tracking = await Tracking.create({
        userId,
        date,
        isSuccess: false,
        totalCalories: 0 
      });
    }

    // Create meal record
    const detail = await TrackingDetails.create({
      trackingId: tracking.trackingId,
      mealtype: mealType,
      foodName: food,
      eatCalories: calories,
      eatProtein: protein || 0,
      eatFat: fat || 0,
      eatCarbon: carbohydrate || 0,
      eatSugar: sugar || 0,
      eatChole: cholesterol || 0
    });

    // Accumulate total calories
    tracking.totalCalories += calories;

    
    // 누적 후 목표 칼로리 비교
    const goal = await Goal.findOne({ where: { userId } });

    if (goal && tracking.totalCalories >= goal.goalCalories) {
      tracking.isSuccess = true;
    }

    await tracking.save();

    return res.status(201).json({
      status: 'success',
      message: 'Meal logged successfully.',
      data: {
        userId,
        date,
        mealType,
        food,
        calories,
        protein: protein || 0,
        fat: fat || 0,
        carbohydrate: carbohydrate || 0,
        sugar: sugar || 0,
        cholesterol: cholesterol || 0
      }
    });

  } catch (err) {
    console.error('Error in logMealByDate:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to log meal.'
    });
  }
};

exports.updateMealLog = async (req, res) => {
  const userId = req.user.userId;
  const { date, detailId } = req.params;
  const {
    mealType,
    food,
    calories,
    protein,
    fat,
    carbohydrate,
    sugar,
    cholesterol
  } = req.body;

  if (!dayjs(date, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid date format. Expected YYYY-MM-DD.'
    });
  }

  try {
    const tracking = await Tracking.findOne({
      where: { userId, date }
    });

    if (!tracking) {
      return res.status(404).json({
        status: 'error',
        message: `No tracking data found for ${date}.`
      });
    }

    const detail = await TrackingDetails.findOne({
      where: {
        detailId,
        trackingId: tracking.trackingId
      }
    });

    if (!detail) {
      return res.status(404).json({
        status: 'error',
        message: `No meal record found with detailId ${detailId} on ${date} for this user.`
      });
    }

    // ✅ 기존 칼로리 백업
    const prevCalories = detail.eatCalories;

    // ✅ 값이 있으면 업데이트
    if (mealType) detail.mealtype = mealType;
    if (food) detail.foodName = food;
    if (calories !== undefined) detail.eatCalories = calories;
    if (protein !== undefined) detail.eatProtein = protein;
    if (fat !== undefined) detail.eatFat = fat;
    if (carbohydrate !== undefined) detail.eatCarbon = carbohydrate;
    if (sugar !== undefined) detail.eatSugar = sugar;
    if (cholesterol !== undefined) detail.eatChole = cholesterol;

    await detail.save();

    // ✅ Tracking의 totalCalories 갱신
    const updatedCalories = detail.eatCalories;
    const diff = updatedCalories - prevCalories;
    tracking.totalCalories = Math.max(0, tracking.totalCalories + diff);

    // ✅ 목표와 비교하여 isSuccess 갱신
    const goal = await Goal.findOne({ where: { userId } });

    if (goal && tracking.totalCalories >= goal.goalCalories) {
      tracking.isSuccess = true;
    } else {
      tracking.isSuccess = false;
    }

    await tracking.save();

    return res.status(200).json({
      status: 'success',
      message: 'Meal record updated successfully.',
      data: {
        detailId: detail.detailId,
        date,
        mealType: detail.mealtype,
        food: detail.foodName,
        calories: detail.eatCalories,
        protein: detail.eatProtein,
        fat: detail.eatFat,
        carbohydrate: detail.eatCarbon,
        sugar: detail.eatSugar,
        cholesterol: detail.eatChole,
        totalCalories: tracking.totalCalories,
        isSuccess: tracking.isSuccess
      }
    });

  } catch (err) {
    console.error('Error in updateMealLog:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update meal record.'
    });
  }
};


exports.deleteTrackingDetail = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const detail = await TrackingDetails.findOne({
      where: { detailId: id },
      include: {
        model: Tracking,
        attributes: ['trackingId', 'userId', 'totalCalories']
      }
    });

    if (!detail || !detail.Tracking) {
      return res.status(404).json({
        status: 'error',
        message: `Tracking detail with id ${id} not found.`,
      });
    }

    if (detail.Tracking.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. This tracking detail does not belong to the user.',
      });
    }

    const caloriesToSubtract = detail.eatCalories || 0;

    await detail.destroy();

    detail.Tracking.totalCalories = Math.max(0, detail.Tracking.totalCalories - caloriesToSubtract);
    await detail.Tracking.save();

    return res.status(200).json({
      status: 'success',
      message: 'Tracking detail deleted successfully.',
      data: {
        totalCalories: detail.Tracking.totalCalories,
      },
    });

  } catch (err) {
    console.error('❌ Error deleting tracking detail:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete tracking detail.',
    });
  }
};
