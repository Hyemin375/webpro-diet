const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const authController = require('../controllers/authController');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Creates a new user account with the provided information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userLoginId
 *               - userPw
 *               - userName
 *               - userSex
 *               - userAge
 *               - userWeight
 *               - userHeight
 *             properties:
 *               userLoginId:
 *                 type: string
 *                 example: orieasy1
 *               userPw:
 *                 type: string
 *                 example: jiwon1234
 *               userName:
 *                 type: string
 *                 example: jiwon
 *               userSex:
 *                 type: string
 *                 enum: [male, female]
 *                 example: female
 *               userAge:
 *                 type: integer
 *                 example: 23
 *               userWeight:
 *                 type: number
 *                 example: 60
 *               userHeight:
 *                 type: number
 *                 example: 172
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 6
 *                     userLoginId:
 *                       type: string
 *                       example: orieasy1
 *                     userName:
 *                       type: string
 *                       example: jiwon
 *                     userSex:
 *                       type: string
 *                       example: female
 *                     userAge:
 *                       type: integer
 *                       example: 23
 *                     userWeight:
 *                       type: number
 *                       example: 60
 *                     userHeight:
 *                       type: number
 *                       example: 172
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     modifiedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Required fields are missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Required fields are missing.
 *       409:
 *         description: Duplicate user login ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User login ID already exists.
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     description: Authenticates a user and returns a JWT access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userLoginId
 *               - userPw
 *             properties:
 *               userLoginId:
 *                 type: string
 *                 example: orieasy1
 *               userPw:
 *                 type: string
 *                 example: jiwon1234
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login ID and password are required.
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login failed
 */
router.post('/login', authController.login);
router.delete('/delete', authenticate, authController.deleteAccount);
router.put('/update', authenticate, authController.updateAccount);
router.put('/password', authenticate, authController.changePassword);

module.exports = router;
