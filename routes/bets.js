const express = require('express');
const router = express.Router();
const betController = require('../controllers/betController');

router.route('/').get(betController.getAllBets).post(betController.placeNewBet);

router
  .route('/:id')
  .get(betController.getSingleBet)
  .delete(betController.cancelBet);

module.exports = router;
