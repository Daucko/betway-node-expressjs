const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/wallet/', verifyJWT, walletController.getWalletInfo);
router.get(
  '/wallet/transactions',
  verifyJWT,
  walletController.getWalletTransactions
);
router.get('/wallet/balance', verifyJWT, walletController.getWalletBalance);

module.exports = router;
