const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

/**
 * @swagger
 * /api/v1/search/categories:
 *   get:
 *     summary: Get food list by category
 *     description: Fetches a list of food names from USDA API based on a given nutrient category (e.g., protein, carb).
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         description: Category of foods to search (e.g., protein, carb, fat, vegetable, fruit, dairy)
 *         schema:
 *           type: string
 *           enum: [protein, carb, fat, vegetable, fruit, dairy]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of food items in the category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Category food list fetched from USDA API.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: Chicken Breast
 *       400:
 *         description: Bad request due to missing or invalid category parameter
 *       500:
 *         description: Internal server error during external API request
 */
router.get('/categories', searchController.getCategoryFoodList);

/**
 * @swagger
 * /api/v1/search/keywords:
 *   get:
 *     summary: Search food items by keyword
 *     description: Returns food information by querying the USDA database with a user-provided keyword.
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Keyword to search (e.g., chicken, rice, apple)
 *     responses:
 *       200:
 *         description: Foods retrieved successfully
 *       400:
 *         description: Bad request (missing or empty keyword)
 *       500:
 *         description: Internal server error
 */
router.get('/keywords', searchController.searchFoodsByKeyword);

module.exports = router;
