const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const authController = require('../controllers/authController');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 사용자 회원가입
 *     tags: [Auth]
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
 *                 example: kate123
 *               userPw:
 *                 type: string
 *                 example: need1234
 *               userName:
 *                 type: string
 *                 example: Kate
 *               userSex:
 *                 type: string
 *                 enum: [male, female]
 *                 example: female
 *               userAge:
 *                 type: integer
 *                 example: 28
 *               userWeight:
 *                 type: number
 *                 example: 60
 *               userHeight:
 *                 type: number
 *                 example: 165
 *     responses:
 *       201:
 *         description: 회원가입 성공
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
 *                       example: 1
 *                     userLoginId:
 *                       type: string
 *                       example: kate123
 *                     userName:
 *                       type: string
 *                       example: Kate
 *       500:
 *         description: 서버 에러 (회원가입 실패)
 */
router.post('/register', authController.register);
router.post('/login', authController.login);
router.delete('/delete', authenticate, authController.deleteAccount);
router.put('/update', authenticate, authController.updateAccount);
router.put('/password', authenticate, authController.changePassword);

module.exports = router;
