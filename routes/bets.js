const express = require('express');
const router = express.Router();
const betController = require('../controllers/betController');

router.route('/').get(betController.getAllBets);

module.exports = router;
