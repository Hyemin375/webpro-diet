const dayjs = require('dayjs');
const axios = require('axios');
const { Goal, Tracking } = require('../models');

console.log("🔑 USDA_API_KEY:", process.env.USDA_API_KEY);

const categoryKeywordMap = {
  protein: [
    'chicken breast', 'tofu', 'egg', 'salmon', 'beef',
    'pork loin', 'turkey breast', 'shrimp', 'tempeh', 'lentils',
    'cottage cheese', 'edamame', 'chickpeas'
  ],
  carb: [
    'pasta', 'brown rice', 'bread', 'oatmeal', 'potato',
    'quinoa', 'barley', 'corn', 'couscous', 'sweet potato',
    'buckwheat', 'tortilla', 'noodles'
  ],
  fat: [
    'avocado', 'olive oil', 'almonds', 'peanut butter',
    'chia seeds', 'sunflower seeds', 'cashews', 'flaxseed',
    'walnuts', 'dark chocolate', 'coconut oil', 'mayonnaise'
  ],
  vegetable: [
    'spinach', 'broccoli', 'carrot', 'kale',
    'zucchini', 'cauliflower', 'bell pepper', 'asparagus',
    'cabbage', 'lettuce', 'mushroom', 'tomato', 'onion'
  ],
  fruit: [
    'banana', 'apple', 'blueberry', 'orange',
    'grapes', 'strawberry', 'kiwi', 'pineapple', 'mango',
    'pear', 'peach', 'cherry', 'watermelon'
  ],
  dairy: [
    'greek yogurt', 'milk', 'cheese',
    'cottage cheese', 'butter', 'cream cheese', 'yogurt',
    'kefir', 'ice cream', 'evaporated milk'
  ]
};


const USDA_API_KEY = process.env.USDA_API_KEY;
const USDA_SEARCH_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

exports.getRecommendedFoods = async (req, res) => {
  const userId = req.user.userId;
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({
      status: 'error',
      message: 'Category parameter is required.',
    });
  }

  const keywords = categoryKeywordMap[category.toLowerCase()];
  if (!keywords) {
    return res.status(400).json({
      status: 'error',
      message: `Invalid category. Available categories: ${Object.keys(categoryKeywordMap).join(', ')}`,
    });
  }

  try {
    const today = dayjs().format('YYYY-MM-DD');

    const tracking = await Tracking.findOne({ where: { userId, date: today } });
    const totalCalories = tracking?.totalCalories || 0;

    const goal = await Goal.findOne({ where: { userId } });

    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not set for user.',
      });
    }

    const deficit = goal.goalCalories - totalCalories;

    if (deficit <= 0) {
      return res.status(200).json({
        status: 'success',
        message: 'You have already reached or exceeded your goal.',
        data: [],
      });
    }

    const combinedQuery = keywords.join(' ');
    const { data } = await axios.get(USDA_SEARCH_URL, {
      params: {
        api_key: USDA_API_KEY,
        query: combinedQuery,
        pageSize: 15,
      },
    });

    // ✅ 외부 API 구조 검사 및 비어있는 경우 처리
    if (!data.foods || data.foods.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No matching foods found for the given category.',
        data: [],
      });
    }

    const results = data.foods
      .map((food) => {
        const energy = food.foodNutrients?.find(n => n.nutrientName === 'Energy');
        return {
          name: food.description,
          calories: energy?.value || null,
          unit: 'kcal',
        };
      })
      .filter(item =>
        typeof item.calories === 'number' &&
        !isNaN(item.calories) &&
        item.calories <= deficit
      )
      .slice(0, 5);

    return res.status(200).json({
      status: 'success',
      message: 'Recommended foods retrieved successfully.',
      data: results,
    });

  } catch (err) {
    console.error('❌ Error fetching recommended foods:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve recommended foods from USDA API.',
    });
  }
};
