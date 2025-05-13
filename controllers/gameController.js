const Game = require('../models/Game');

const createGame = async (req, res) => {
  const { homeTeam, awayTeam, sport, startTime, odds } = req.body;
  try {
    // Create game
    const game = await Game.create({
      homeTeam,
      awayTeam,
      sport,
      startTime,
      odds,
    });
    res.status(201).json({ message: 'Game created successfully', data: game });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = createGame;
