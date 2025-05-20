const Game = require('../models/Game');

const getAllGames = async (req, res) => {
  try {
    const query = {};
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by sport if provided
    if (req.query.sport) {
      query.sport = req.query.sport;
    }

    const games = await Game.find(query);
    if (!games || games.length === 0)
      return res.status(204).json({ message: 'No game found' });

    res.status(200).json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

const getSingleGame = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Game not found' });

    const game = await Game.findById(id);
    if (!game)
      return res.status(204).json({ message: `No game matches this ID ${id}` });
    res.status(200).json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllGames, createGame, getSingleGame };
