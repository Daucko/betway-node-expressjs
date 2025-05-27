const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const verifyAdmin = require('../middleware/verifyAdmin');
const verifyJWT = require('../middleware/verifyJWT');

router
  .route('/games')
  .get(verifyJWT, gameController.getAllGames)
  .post(verifyJWT, verifyAdmin, gameController.createGame);

router.get('/games/:id', verifyJWT, gameController.getSingleGame);
router
  .route('/games/:id/result')
  .get(verifyJWT, gameController.getSingleGameResult)
  .patch(verifyJWT, verifyAdmin, gameController.updateGameResult);
router.get('/games/results', verifyJWT, gameController.getGameResults);

module.exports = router;
