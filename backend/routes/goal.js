const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const authenticate = require('../middlewares/auth');

// 목표 설정 라우터
/**
 * @swagger
 * /api/v1/goal:
 *   post:
 *     summary: Create or update nutrition goal
 *     description: Set a user's nutrition goal. If a goal already exists, it will be updated.
 *     tags:
 *       - Goal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - calories
 *             properties:
 *               calories:
 *                 type: integer
 *                 example: 2000
 *                 description: Required. Must be a positive integer.
 *               protein:
 *                 type: integer
 *                 example: 100
 *               fat:
 *                 type: integer
 *                 example: 70
 *               carbohydrate:
 *                 type: integer
 *                 example: 300
 *               sugar:
 *                 type: integer
 *                 example: 50
 *               cholesterol:
 *                 type: integer
 *                 example: 300
 *     responses:
 *       201:
 *         description: Nutrition goal created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nutrition goal created successfully.
 *                 goal:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 42
 *                     calories:
 *                       type: integer
 *                       example: 2000
 *                     protein:
 *                       type: integer
 *                       example: 100
 *                     fat:
 *                       type: integer
 *                       example: 70
 *                     carbohydrate:
 *                       type: integer
 *                       example: 300
 *                     sugar:
 *                       type: integer
 *                       example: 50
 *                     cholesterol:
 *                       type: integer
 *                       example: 300
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, goalController.setGoal);

// 목표 조회 라우터
/**
 * @swagger
 * /api/v1/goal:
 *   get:
 *     summary: Get the user's nutrition goal
 *     tags:
 *       - Goal
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the current nutrition goal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 goal:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     calories:
 *                       type: integer
 *                       example: 2000
 *                     protein:
 *                       type: integer
 *                       example: 100
 *                     fat:
 *                       type: integer
 *                       example: 70
 *                     carbohydrate:
 *                       type: integer
 *                       example: 250
 *                     sugar:
 *                       type: integer
 *                       example: 30
 *                     cholesterol:
 *                       type: integer
 *                       example: 200
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Nutrition goal not found
 *       500:
 *         description: Server error or invalid goal data
 */
router.get('/', authenticate, goalController.getGoal);

// 목표 수정 라우터
/**
 * @swagger
 * /api/v1/goal:
 *   put:
 *     summary: Update the user's nutrition goal
 *     tags:
 *       - Goal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               calories:
 *                 type: integer
 *                 example: 2000
 *               protein:
 *                 type: integer
 *                 example: 100
 *               fat:
 *                 type: integer
 *                 example: 70
 *               carbohydrate:
 *                 type: integer
 *                 example: 250
 *               sugar:
 *                 type: integer
 *                 example: 30
 *               cholesterol:
 *                 type: integer
 *                 example: 200
 *     responses:
 *       200:
 *         description: Nutrition goal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nutrition goal updated successfully.
 *                 goal:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     calories:
 *                       type: integer
 *                       example: 2000
 *                     protein:
 *                       type: integer
 *                       example: 100
 *                     fat:
 *                       type: integer
 *                       example: 70
 *                     carbohydrate:
 *                       type: integer
 *                       example: 250
 *                     sugar:
 *                       type: integer
 *                       example: 30
 *                     cholesterol:
 *                       type: integer
 *                       example: 200
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Goal not found
 *       500:
 *         description: Server error
 */
router.put('/', authenticate, goalController.updateGoal);

// 목표 삭제 라우터
/**
 * @swagger
 * /api/v1/goal:
 *   delete:
 *     summary: Delete the user's nutrition goal
 *     tags:
 *       - Goal
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nutrition goal deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Nutrition goal deleted successfully
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *       404:
 *         description: No nutrition goal found to delete
 *       500:
 *         description: Server error
 */
router.delete('/', authenticate, goalController.deleteGoal);

// 목표 달성도 조회 라우터
/**
 * @swagger
 * /api/v1/goal/progress:
 *   get:
 *     summary: Get user's nutrition goal progress (today, last 7 and 30 days)
 *     tags:
 *       - Goal
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nutrition progress data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: 2025-06-14
 *                 today:
 *                   type: object
 *                   properties:
 *                     caloriesConsumed:
 *                       type: number
 *                       example: 1540
 *                     caloriesGoal:
 *                       type: number
 *                       example: 2000
 *                     achievedPercent:
 *                       type: number
 *                       example: 77.0
 *                 summary:
 *                   type: object
 *                   properties:
 *                     last7days:
 *                       type: object
 *                       properties:
 *                         averageAchievedPercent:
 *                           type: number
 *                           example: 82.5
 *                     last30days:
 *                       type: object
 *                       properties:
 *                         averageAchievedPercent:
 *                           type: number
 *                           example: 79.3
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No nutrition goal set
 *       500:
 *         description: Server error while calculating progress
 */
router.get('/progress', authenticate, goalController.getProgress);


module.exports = router;
