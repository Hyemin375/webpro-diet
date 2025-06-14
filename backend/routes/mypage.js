const express = require('express');
const router = express.Router();
const mypageController = require('../controllers/mypageController');
const authenticate = require('../middlewares/authMiddleware');

// 인증된 사용자만 접근 가능
router.use(authenticate);

// 내 정보 조회
router.get('/', mypageController.getMyInfo);

// 정보 수정
router.put('/', mypageController.updateAccount);

// 비밀번호 변경
router.put('/password', mypageController.changePassword);

// 회원 탈퇴
/**
 * @swagger
 * /auth/delete:
 *   delete:
 *     summary: Delete user account
 *     tags: [Auth]
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
router.delete('/', mypageController.deleteAccount);

module.exports = router;
