const express = require('express');
const router = express.Router();
const mypageController = require('../controllers/mypageController');
const authenticate = require('../middlewares/auth');

// 인증된 사용자만 접근 가능
router.use(authenticate);

// 내 정보 조회
/**
 * @swagger
 * /api/v1/mypage/profile:
 *   get:
 *     summary: Get user profile
 *     description: Returns the authenticated user's profile information.
 *     tags: [Mypage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                 userName:
 *                   type: string
 *                   example: "euna123"
 *                 userSex:
 *                   type: string
 *                   enum: [male, female]
 *                   example: "female"
 *                 userAge:
 *                   type: integer
 *                   example: 23
 *                 userWeight:
 *                   type: number
 *                   format: float
 *                   example: 53
 *                 userHeight:
 *                   type: number
 *                   format: float
 *                   example: 162
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authentication required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User profile not found"
 */
router.get('/profile', mypageController.getMyInfo);

// 정보 수정
/**
 * @swagger
 * /api/v1/mypage/update:
 *   put:
 *     summary: Update user information
 *     tags: [Mypage]
 *     description: Updates the authenticated user's profile information.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *                 example: 50
 *               userHeight:
 *                 type: number
 *                 example: 162
 *     responses:
 *       200:
 *         description: User information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User information updated successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
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
 *                       example: 50
 *                     userHeight:
 *                       type: number
 *                       example: 162
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization token is required.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to update user information
 */
router.put('/update', mypageController.updateAccount);

// 비밀번호 변경
/**
 * @swagger
 * /api/v1/mypage/password:
 *   put:
 *     summary: Change user password
 *     description: Change the password of the currently authenticated user. The current password and user login ID must match.
 *     tags: [Mypage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userLoginId
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               userLoginId:
 *                 type: string
 *                 example: testuser1
 *               currentPassword:
 *                 type: string
 *                 example: oldPassword123
 *               newPassword:
 *                 type: string
 *                 example: newPassword456
 *     responses:
 *       200:
 *         description: Password successfully changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully.
 *       401:
 *         description: Incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Current password is incorrect.
 *       403:
 *         description: Login ID does not match the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login ID does not match the token user.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to change password.
 */
router.put('/password', mypageController.changePassword);

// 회원 탈퇴
/**
 * @swagger
 * /api/v1/mypage/delete:
 *   delete:
 *     summary: Delete user account
 *     tags: [Mypage]
 *     description: Permanently deletes the authenticated user's account and related data.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User account deleted successfully.
 *       401:
*         description: Unauthorized - no valid token provided
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "Unauthorized: user not authenticated"
*       404:
*         description: User not found
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "User not found."
*       500:
*         description: Internal server error
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "Server error occurred."
*/
router.delete('/delete', mypageController.deleteAccount);

module.exports = router;
