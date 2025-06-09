const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const checkIsVerified = require('../middleware/checkIsVerified');

router.post('/auth/register', authController.handleRegistration);
router.post('/auth/login', checkIsVerified, authController.handleLogin);
router.post(
  '/auth/forgot-password',
  checkIsVerified,
  authController.handleForgotPassword
);
router.patch(
  '/auth/reset-password',
  checkIsVerified,
  authController.handleResetPassword
);

module.exports = router;
