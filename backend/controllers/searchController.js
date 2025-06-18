const axios = require('axios');
const { Goal, Tracking } = require('../models');

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
/**
 * 카테고리 기반 음식 조회
 */
exports.getCategoryFoodList = async (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({
      status: 'error',
      message: 'Category query parameter is required.',
    });
  }

  const keywords = categoryKeywordMap[category.toLowerCase()];
  if (!keywords) {
    return res.status(400).json({
      status: 'error',
      message: `Invalid category. Available: ${Object.keys(categoryKeywordMap).join(', ')}`,
    });
  }

  try {
    const combinedQuery = keywords.join(' ');
    const { data } = await axios.get(USDA_SEARCH_URL, {
      params: {
        api_key: USDA_API_KEY,
        query: combinedQuery,
        pageSize: 20,
      },
    });

    if (!data.foods || data.foods.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No foods found for the given category.',
        data: [],
      });
    }

    const foodNames = data.foods.map((food) => food.description).slice(0, 10);

    return res.status(200).json({
      status: 'success',
      message: 'Category food list fetched from USDA API.',
      data: foodNames,
    });
  } catch (err) {
    console.error('❌ USDA API error:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch category foods from USDA API.',
    });
  }
};

/**
 * 키워드 기반 음식 검색
 */
exports.searchFoodsByKeyword = async (req, res) => {
  const { keyword } = req.query;

  if (!keyword || keyword.trim() === '') {
    return res.status(400).json({
      status: 'error',
      message: 'Keyword query parameter is required.',
    });
  }

  try {
    const { data } = await axios.get(USDA_SEARCH_URL, {
      params: {
        api_key: USDA_API_KEY,
        query: keyword,
        pageSize: 10,
      },
    });

    if (!data.foods || data.foods.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No results found for the given keyword.',
        data: [],
      });
    }

    const results = data.foods.map((food) => {
      const calories = food.foodNutrients?.find(n => n.nutrientName === 'Energy');
      return {
        name: food.description,
        calories: calories?.value || null,
        unit: 'kcal',
      };
    });

    return res.status(200).json({
      status: 'success',
      message: 'Foods retrieved successfully.',
      data: results,
    });

  } catch (err) {
    console.error('❌ Error searching foods:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to search foods from USDA API.',
    });
  }
};
