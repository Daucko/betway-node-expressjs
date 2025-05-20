const express = require('express');
const router = express.Router();
const betController = require('../controllers/betController');

router.route('/').get(betController.getAllBets).post(betController.placeNewBet);

module.exports = router;
