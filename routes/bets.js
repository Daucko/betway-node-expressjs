const express = require('express');
const router = express.Router();
const betController = require('../controllers/betController');
const verifyJWT = require('../middleware/verifyJWT');

router
  .route('/bets')
  .get(verifyJWT, betController.getAllBets)
  .post(verifyJWT, betController.placeNewBet);

router
  .route('/bets/:id')
  .get(verifyJWT, betController.getSingleBet)
  .delete(verifyJWT, betController.cancelBet);

router.get(
  '/bets/stats/summary',
  verifyJWT,
  betController.getBettingStatistics
);

module.exports = router;
