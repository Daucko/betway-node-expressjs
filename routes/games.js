const express = require('express');
const router = express.Router();
const createGame = require('../controllers/gameController');
const verifyAdmin = require('../middleware/verifyAdmin');

router.post('/', verifyAdmin, createGame);

module.exports = router;
