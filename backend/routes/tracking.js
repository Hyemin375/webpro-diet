const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * /api/v1/tracking/calendar:
 *   post:
 *     tags:
 *       - Tracking
 *     summary: Retrieve calendar tracking data by month
 *     description: "Returns a list of daily tracking data for the specified year and month, including goal achievement status and calories consumed, based on the authenticated user."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *                 example: 2025
 *                 description: "Year to fetch tracking data for (defaults to current year)."
 *               month:
 *                 type: integer
 *                 example: 5
 *                 description: "Month to fetch tracking data for (1–12, defaults to current month)."
 *     responses:
 *       200:
 *         description: "Successfully retrieved tracking data for the month."
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
 *                   example: Tracking data for 2025-05
 *                 data:
 *                   type: object
 *                   properties:
 *                     yearMonth:
 *                       type: string
 *                       example: "2025-05"
 *                     days:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2025-05-01"
 *                           isSuccess:
 *                             type: boolean
 *                             example: true
 *                           caloriesConsumed:
 *                             type: integer
 *                             example: 1850
 *       400:
 *         description: "Invalid year or month format."
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
 *                   example: Invalid year or month. Month must be 1–12 and year must be a valid number.
 *       500:
 *         description: "Server error occurred while fetching tracking data."
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
 *                   example: Failed to fetch calendar tracking.
 */
router.get('/calendar', authMiddleware, trackingController.getCalendarTracking);

/**
 * @swagger
 * /api/v1/tracking/calendar/{date}/details:
 *   get:
 *     tags:
 *       - Tracking
 *     summary: Get detailed meal records for a specific date
 *     description: "Returns the meals consumed on a specific date with nutrition info for the authenticated user."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-05-30"
 *         description: "Date in YYYY-MM-DD format"
 *     responses:
 *       200:
 *         description: "Meal records retrieved successfully."
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
 *                   example: Meal records found for 2025-05-30.
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       example: "2025-05-30"
 *                     meals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mealType:
 *                             type: string
 *                             enum: [breakfast, lunch, dinner, snack]
 *                             example: lunch
 *                           foodName:
 *                             type: string
 *                             example: Grilled Chicken
 *                           calories:
 *                             type: integer
 *                             example: 350
 *                           protein:
 *                             type: integer
 *                             example: 40
 *                           fat:
 *                             type: integer
 *                             example: 8
 *                           carbohydrate:
 *                             type: integer
 *                             example: 15
 *                           sugar:
 *                             type: integer
 *                             example: 1
 *                           cholesterol:
 *                             type: integer
 *                             example: 90
 *       400:
 *         description: "Invalid date format"
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
 *                   example: Invalid date format. Expected YYYY-MM-DD.
 *       404:
 *         description: "No meal data found"
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
 *                   example: No meal data found for 2025-05-30.
 *       500:
 *         description: "Internal server error"
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
 *                   example: Failed to retrieve tracking data.
 */
router.get('/calendar/:date/details', authMiddleware, trackingController.getTrackingByDate);

module.exports = router;
