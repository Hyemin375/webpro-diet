const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');

const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.delete('/delete', authenticate, authController.deleteAccount);
router.put('/update', authenticate, authController.updateAccount);


module.exports = router;
