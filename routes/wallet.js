const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.get('/', walletController.getWalletInfo);
router.get('/transactions', walletController.getWalletTransactions);
router.get('/balance', walletController.getWalletBalance);

module.exports = router;
