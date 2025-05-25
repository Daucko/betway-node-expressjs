const express = require('express');
const router = express.Router();
const betController = require('../controllers/betController');
const verifyJWT = require('../middleware/verifyJWT');

router.route('/').get(betController.getAllBets).post(betController.placeNewBet);

router
  .route('/:id')
  .get(verifyJWT, betController.getSingleBet)
  .delete(verifyJWT, betController.cancelBet);

router.get('/stats/summary', verifyJWT, betController.getBettingStatistics);

module.exports = router;
