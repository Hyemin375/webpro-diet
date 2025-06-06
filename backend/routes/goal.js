const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const authenticate = require('../middlewares/auth');

// 목표 설정 라우터
router.post('/', authenticate, goalController.setGoal);

// 목표 조회 라우터
router.get('/', authenticate, goalController.getGoal);

// 목표 수정 라우터
router.put('/', authenticate, goalController.updateGoal);

// 목표 삭제 라우터
router.delete('/', authenticate, goalController.deleteGoal);

module.exports = router;
