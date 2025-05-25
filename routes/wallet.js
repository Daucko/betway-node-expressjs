const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, walletController.getWalletInfo);
router.get('/transactions', verifyJWT, walletController.getWalletTransactions);
router.get('/balance', verifyJWT, walletController.getWalletBalance);

module.exports = router;
