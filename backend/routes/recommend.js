const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * /api/v1/recommendations:
 *   get:
 *     summary: Get recommended foods by category and calorie deficit
 *     description: 
 *       Suggests food items from the USDA database based on the user's remaining daily calorie goal and selected food category.
 *       This endpoint calculates the user's calorie deficit for today and fetches appropriate food recommendations.
 *     tags:
 *       - Recommendation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [protein, carb, fat, vegetable, fruit, dairy]
 *         required: true
 *         description: Food category to base recommendations on
 *     responses:
 *       200:
 *         description: Recommended foods retrieved successfully or no recommendation needed
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
 *                   example: Recommended foods retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Chicken Breast
 *                       calories:
 *                         type: number
 *                         example: 165
 *                       unit:
 *                         type: string
 *                         example: kcal
 *       400:
 *         description: Missing or invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Category parameter is required.
 *       404:
 *         description: User goal not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Goal not set for user.
 *       500:
 *         description: Server or USDA API error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve recommended foods from USDA API.
 */
router.get('/recommendations', authMiddleware, recommendController.getRecommendedFoods);


module.exports = router;
