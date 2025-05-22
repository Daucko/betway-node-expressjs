const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const verifyAdmin = require('../middleware/verifyAdmin');

router
  .route('/')
  .get(gameController.getAllGames)
  .post(verifyAdmin, gameController.createGame);

router.get('/:id', gameController.getSingleGame);
router.patch('/:id/result', verifyAdmin, gameController.updateGameResult);

module.exports = router;
