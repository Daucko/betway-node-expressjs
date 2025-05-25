const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const verifyAdmin = require('../middleware/verifyAdmin');
const verifyJWT = require('../middleware/verifyJWT');

router
  .route('/')
  .get(verifyJWT, gameController.getAllGames)
  .post(verifyJWT, verifyAdmin, gameController.createGame);

router.get('/:id', verifyJWT, gameController.getSingleGame);
router.patch(
  '/:id/result',
  verifyJWT,
  verifyAdmin,
  gameController.updateGameResult
);

module.exports = router;
