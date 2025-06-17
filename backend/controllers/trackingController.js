const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { Tracking, TrackingDetails, User } = require('../models');

exports.getCalendarTracking = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { year, month } = req.body;

    // year, month 유효성 검사
    if ((year && isNaN(year)) || (month && (isNaN(month) || month < 1 || month > 12))) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid year or month. Month must be 1–12 and year must be a valid number.'
      });
    }

    // 기본값: 이번 달
    const targetYear = year || dayjs().year();
    const targetMonth = month || dayjs().month() + 1; // dayjs는 0-indexed month
    const startDate = dayjs(`${targetYear}-${targetMonth}-01`);
    const endDate = startDate.endOf('month');

    // 모든 트래킹 데이터 가져오기 (Tracking + TrackingDetails 조인)
    const trackings = await Tracking.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
        }
      },
      include: [{ model: TrackingDetails }]
    });

    // 날짜별 결과 구성
    const days = [];
    for (
      let d = startDate;
      d.isBefore(endDate) || d.isSame(endDate);
      d = d.add(1, 'day')
    ) {
      const dateStr = d.format('YYYY-MM-DD');
      const record = trackings.find(t => t.date === dateStr);

      const caloriesConsumed = record?.TrackingDetails?.reduce(
        (sum, item) => sum + (item.eatCalories || 0),
        0
      ) || 0;

      const isSuccess = record?.isSuccess || false;

      days.push({ date: dateStr, isSuccess, caloriesConsumed });
    }

    return res.status(200).json({
      status: 'success',
      message: `Tracking data for ${startDate.format('YYYY-MM')}`,
      data: {
        yearMonth: startDate.format('YYYY-MM'),
        days
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch calendar tracking.'
    });
  }
};

exports.getTrackingByDate = async (req, res) => {
  const userId = req.user.userId;
  const { date } = req.params;

  if (!dayjs(date, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid date format. Expected YYYY-MM-DD.'
    });
  }

  try {
    const tracking = await Tracking.findOne({
      where: { userId, date },
      include: [{
        model: TrackingDetails,
        attributes: [
            'mealtype', 
            'foodName', 
            'eatCalories', 
            'eatProtein', 
            'eatFat', 
            'eatCarbon', 
            'eatSugar', 
            'eatChole'
        ]
      }]
    });

    if (!tracking || tracking.TrackingDetails.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `No meal data found for ${date}.`
      });
    }

    const meals = tracking.TrackingDetails.map(meal => ({
      mealType: meal.mealtype,
      foodName: meal.foodName,
      calories: meal.eatCalories,
      protein: meal.eatProtein,
      fat: meal.eatFat,
      carbohydrate: meal.eatCarbon,
      sugar: meal.eatSugar,
      cholesterol: meal.eatChole
    }));

    res.status(200).json({
      status: 'success',
      message: `Meal records found for ${date}.`,
      data: {
        date,
        meals
      }         
    });


  } catch (err) {
    console.error('Error in getTrackingByDate:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve tracking data.'
    });
  }
};
