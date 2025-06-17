const express = require('express');
const router = express.Router();
const loggingController = require('../controllers/loggingController');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * /api/v1/tracking/{date}:
 *   post:
 *     tags:
 *       - Tracking
 *     summary: Log a new meal for a specific date
 *     description: Adds a new meal record for the given date. The user must be authenticated.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         description: "Date of the meal to log (format: YYYY-MM-DD)"
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-05-30"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mealType
 *               - food
 *               - calories
 *             properties:
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *                 example: lunch
 *               food:
 *                 type: string
 *                 example: "닭가슴살"
 *               calories:
 *                 type: integer
 *                 example: 320
 *               protein:
 *                 type: integer
 *                 example: 42
 *               fat:
 *                 type: integer
 *                 example: 5
 *               carbohydrate:
 *                 type: integer
 *                 example: 1
 *               sugar:
 *                 type: integer
 *                 example: 0
 *               cholesterol:
 *                 type: integer
 *                 example: 95
 *     responses:
 *       201:
 *         description: Meal logged successfully
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
 *                   example: "Meal logged successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2025-05-30"
 *                     mealType:
 *                       type: string
 *                       example: lunch
 *                     food:
 *                       type: string
 *                       example: "닭가슴살"
 *                     calories:
 *                       type: integer
 *                       example: 320
 *                     protein:
 *                       type: integer
 *                       example: 42
 *                     fat:
 *                       type: integer
 *                       example: 5
 *                     carbohydrate:
 *                       type: integer
 *                       example: 1
 *                     sugar:
 *                       type: integer
 *                       example: 0
 *                     cholesterol:
 *                       type: integer
 *                       example: 95
 *       400:
 *         description: Invalid input data or missing required fields
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
 *                   example: "Missing required fields: mealType, food, or calories."
 *       404:
 *         description: User not found
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
 *                   example: "User with userId 1 not found."
 *       500:
 *         description: Server error during meal logging
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
 *                   example: "Failed to log meal."
 */
router.post('/:date', authMiddleware, loggingController.logMealByDate);

/**
 * @swagger
 * /api/v1/tracking/{date}/{detailId}:
 *   put:
 *     tags:
 *       - Tracking
 *     summary: Update a specific meal record
 *     description: "Updates the user's specific meal log for the given date and detailId."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         description: "Date of the meal record to update (format: YYYY-MM-DD)"
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-05-30"
 *       - in: path
 *         name: detailId
 *         required: true
 *         description: "ID of the specific meal detail to update"
 *         schema:
 *           type: integer
 *           example: 101
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *                 example: lunch
 *               food:
 *                 type: string
 *                 example: "닭가슴살"
 *               calories:
 *                 type: integer
 *                 example: 320
 *               protein:
 *                 type: integer
 *                 example: 42
 *               fat:
 *                 type: integer
 *                 example: 5
 *               carbohydrate:
 *                 type: integer
 *                 example: 1
 *               sugar:
 *                 type: integer
 *                 example: 0
 *               cholesterol:
 *                 type: integer
 *                 example: 95
 *     responses:
 *       200:
 *         description: "Meal record updated successfully."
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
 *                   example: Meal record updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     detailId:
 *                       type: integer
 *                       example: 101
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2025-05-30"
 *                     mealType:
 *                       type: string
 *                       example: lunch
 *                     food:
 *                       type: string
 *                       example: "닭가슴살"
 *                     calories:
 *                       type: integer
 *                       example: 320
 *                     protein:
 *                       type: integer
 *                       example: 42
 *                     fat:
 *                       type: integer
 *                       example: 5
 *                     carbohydrate:
 *                       type: integer
 *                       example: 1
 *                     sugar:
 *                       type: integer
 *                       example: 0
 *                     cholesterol:
 *                       type: integer
 *                       example: 95
 */
router.put('/:date/:detailId', authMiddleware, loggingController.updateMealLog);

/**
 * @swagger
 * /api/v1/tracking/detail/{id}:
 *   delete:
 *     summary: Delete a specific tracking detail
 *     description: Deletes a specific tracking detail and subtracts its calories from the related tracking record.
 *     tags:
 *       - Logging
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the tracking detail to delete (detailId)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tracking detail deleted successfully
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
 *                   example: Tracking detail deleted successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCalories:
 *                       type: number
 *                       example: 1200
 *       403:
 *         description: Access denied - the tracking detail does not belong to the user
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
 *                   example: Access denied. This tracking detail does not belong to the user.
 *       404:
 *         description: Tracking detail not found
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
 *                   example: Tracking detail with id 1 not found.
 *       500:
 *         description: Internal server error
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
 *                   example: Failed to delete tracking detail.
 */
router.delete('/detail/:id', authMiddleware, loggingController.deleteTrackingDetail);

module.exports = router;
