const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/auth/register', authController.handleRegistration);
router.post('/auth/login', authController.handleLogin);
router.post('/auth/forgot-password', authController.handleForgotPassword);
router.patch('/auth/reset-password', authController.handleResetPassword);

module.exports = router;
