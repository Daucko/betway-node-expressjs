const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.handleRegistration);
router.post('/login', authController.handleLogin);
router.post('/forgot-password', authController.handleForgotPassword);
router.patch('/reset-password', authController.handleResetPassword);

module.exports = router;
