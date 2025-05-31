const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const authenticate = require('../middlewares/auth');

router.post('/', authenticate, goalController.setGoal);

module.exports = router;
