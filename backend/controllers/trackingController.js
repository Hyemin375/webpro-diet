const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { Tracking, TrackingDetails, User, Goal } = require('../models'); // Goal 추가

exports.getCalendarTracking = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { year, month } = req.query;

    if ((year && isNaN(year)) || (month && (isNaN(month) || month < 1 || month > 12))) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid year or month. Month must be 1–12 and year must be a valid number.'
      });
    }

    const targetYear = year || dayjs().year();
    const targetMonth = month || dayjs().month() + 1;
    const startDate = dayjs(`${targetYear}-${targetMonth}-01`);
    const endDate = startDate.endOf('month');

    const goal = await Goal.findOne({ where: { userId } });
    console.log('[DEBUG] Goal fetched:', goal);
    console.log('[DEBUG] Goal calories:', goal?.goalCalories);


    const trackings = await Tracking.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
        }
      },
      include: [{ model: TrackingDetails }]
    });

    const days = [];

    for (
      let d = startDate;
      d.isBefore(endDate) || d.isSame(endDate);
      d = d.add(1, 'day')
    ) {
      const dateStr = d.format('YYYY-MM-DD');
      const record = trackings.find(t => dayjs(t.date).format('YYYY-MM-DD') === dateStr);

      const totalCalories = record?.totalCalories || 0;

      let isSuccess = false;
      if (goal && totalCalories >= goal.goalCalories) {
        isSuccess = true;

        // ✅ DB에 저장된 값이 false면 update
        if (record && !record.isSuccess) {
          record.isSuccess = true;
          await record.save();
        }
      } else {
        if (record && record.isSuccess) {
          record.isSuccess = false;
          await record.save();
        }
      }

      days.push({ date: dateStr, isSuccess, totalCalories });
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
