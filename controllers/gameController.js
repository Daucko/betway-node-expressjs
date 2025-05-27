const Game = require('../models/Game');
const Bet = require('../models/Bet');

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

const updateGameResult = async (req, res) => {
  try {
    const {
      outcome,
      homeScore,
      awayScore,
      halfTimeHomeScore,
      halfTimeAwayScore,
      description,
    } = req.body;
    const id = req.params.id;

    // Validate required fields
    if (
      outcome === undefined ||
      homeScore === undefined ||
      awayScore === undefined
    )
      return res
        .status(400)
        .json({ message: 'Please provide outcome, homeScore and awayScore' });

    // Find the game
    const game = await Game.findById(id);

    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Calculate total goals and btts
    const totalGoals = homeScore + awayScore;
    const btts = homeScore > 0 && awayScore > 0;

    // Update game result
    game.result = {
      outcome,
      homeScore,
      awayScore,
      totalGoals,
      btts,
      halfTimeHomeScore: halfTimeHomeScore || null,
      halfTimeAwayScore: halfTimeAwayScore || null,
      description: description || '',
    };

    // Update game status to finished
    game.status = 'finished';

    await game.save();

    // Process all pending bets for this game
    await processBets(game._id);

    res.status(200).json({
      message: 'Game result updated and bets processed',
      data: game,
    });
  } catch (err) {
    console.error('Error updating game result:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

const processBets = async (gameId) => {
  try {
    // Get the game with full
    const game = await Game.findById(gameId);

    if (!game || game.status !== 'finished')
      throw new Error(`Game not found or not finished with ID: ${gameId}`);

    // Find all pending bets for this game
    const bets = await Bet.find({ game: gameId, status: 'pending' });

    if (bets.length === 0) {
      console.log(`No pending bets found for game: ${gameId}`);
      return;
    }

    // Extract game result details for easier reference
    const {
      outcome,
      homeScore,
      awayScore,
      totalGoals,
      btts,
      halfTimeHomeScore,
      halfTimeAwayScore,
    } = game.result;

    // Get half-time result
    let halfTimeResult = null;
    if (halfTimeHomeScore !== null && halfTimeAwayScore !== null) {
      if (halfTimeHomeScore > halfTimeAwayScore) {
        halfTimeResult = 'homeWin';
      } else if (halfTimeHomeScore < halfTimeAwayScore) {
        halfTimeResult = 'awayWin';
      } else {
        halfTimeResult = 'draw';
      }
    }

    // Create HT/FT result string for comparison
    const halfTimeFullTimeResult = halfTimeResult
      ? `${halfTimeResult}/${outcome}`
      : null;

    // Format correct score for comparison
    const correctScore = `${homeScore} - ${awayScore}`;

    // Process each bet
    for (const bet of bets) {
      let betWon = false;

      // Determine if bet won based on outcome type
      switch (bet.outcome.type) {
        // Match outcomes
        case 'homeWin':
          betWon = outcome === 'homeWin';
          break;
        case 'awayWin':
          betWon = outcome === 'awayWin';
          break;
        case 'draw':
          betWon = outcome === 'draw';
          break;

        // Goals
        case 'over15':
          betWon = totalGoals > 1.5;
          break;
        case 'under15':
          betWon = totalGoals < 1.5;
          break;
        case 'over25':
          betWon = totalGoals > 2.5;
          break;
        case 'under25':
          betWon = totalGoals < 2.5;
          break;
        case 'over35':
          betWon = totalGoals > 3.5;
          break;
        case 'under35':
          betWon = totalGoals < 3.5;
          break;

        // Both teams to score
        case 'bttsYes':
          betWon = btts === true;
          break;
        case 'bttsNo':
          betWon = btts === false;
          break;

        // Double chance
        case 'homeWinOrDraw':
          betWon = outcome === 'homeWin' || outcome === 'draw';
          break;
        case 'homeWinOrAwayWin':
          betWon = outcome === 'homeWin' || outcome === 'awayWin';
          break;
        case 'awayWinOrDraw':
          betWon = outcome === 'awayWin' || outcome === 'draw';
          break;

        // Special bets that need outcome.value
        case 'correctScore':
          betWon = bet.outcome.value === correctScore;
          break;

        case 'halfTimeFullTime':
          betWon =
            halfTimeFullTimeResult &&
            bet.outcome.value === halfTimeFullTimeResult;
          break;

        default:
          betWon = false;
      }

      // Update bet status and payout
      if (betWon) {
        // Calculate actual payout (stake * odds)
        const actualPayout = parseFloat(
          (bet.stake.amount * bet.outcome.odds).toFixed(2)
        );

        // Update bet status to won and set actual payout
        bet.status = 'won';
        bet.payout.actual = actualPayout;
        bet.settleAt = new Date();

        // Update user wallet with winnings
        await User.findByIdAndUpdate(bet.user, {
          $inc: { 'wallet.balance': actualPoint },
          $push: {
            'wallet.transactions': {
              type: 'win',
              amount: actualPayout,
              description: `Won bet on ${game.homeTeam} vs ${game.awayTeam} (${bet.outcome.type})`,
            },
          },
        });

        console.log(
          `Bet ${bet._id} won. Paid out ${actualPayout} to user ${bet.user}`
        );
      } else {
        // Update bet status to lost
        bet.status = 'lost';
        bet.settleAt = new Date();
        console.log(`Bet ${bet._id} lost.`);
      }
      await bet.save();
    }

    console.log(`Processes all bets for game ${gameId}`);
  } catch (err) {
    console.error('Error processing bets:', err);
    throw err;
  }
};

const getGameResults = async (req, res) => {
  try {
    // Find finished games with results
    const games = await Game.find({ status: 'finished' })
      .sort({ startTime: -1 })
      .select('homeTeam awayTeam sport startTime result odds status');

    if (!games || games.length === 0) {
      return res.status(404).json({ message: 'No finished games found' });
    }

    // Format response with results summary
    const formattedResults = games.map((game) => ({
      id: game._id,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      sport: game.sport,
      startTime: game.startTime,
      result: {
        outcome: game.result.outcome,
        score: `${game.result.homeScore} - ${game.result.awayScore}`,
        homeScore: game.result.homeScore,
        awayScore: game.result.awayScore,
        totalGoals: game.result.totalGoals,
        btts: game.result.btts,
        halfTimeScore:
          game.result.halfTimeHomeScore !== null &&
          game.result.halfTimeAwayScore !== null
            ? `${game.result.halfTimeHomeScore} - ${game.result.halfTimeAwayScore}`
            : null,
        description: game.result.description || '',
      },
      odds: game.odds,
    }));

    res.status(200).json({
      message: 'Game results retrieved successfully',
      data: formattedResults,
    });
  } catch (err) {
    console.error('Error fetching game results:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

// Additional function to get a single game result by ID
const getSingleGameResult = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: 'Game ID is required' });
    }

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ message: `No game found with ID ${id}` });
    }

    if (game.status !== 'finished') {
      return res.status(400).json({
        message: 'Game has not finished yet',
        gameStatus: game.status,
      });
    }

    // Format detailed result response
    const detailedResult = {
      id: game._id,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      sport: game.sport,
      startTime: game.startTime,
      status: game.status,
      odds: game.odds,
      result: {
        outcome: game.result.outcome,
        finalScore: {
          home: game.result.homeScore,
          away: game.result.awayScore,
          display: `${game.result.homeScore} - ${game.result.awayScore}`,
        },
        halfTimeScore:
          game.result.halfTimeHomeScore !== null &&
          game.result.halfTimeAwayScore !== null
            ? {
                home: game.result.halfTimeHomeScore,
                away: game.result.halfTimeAwayScore,
                display: `${game.result.halfTimeHomeScore} - ${game.result.halfTimeAwayScore}`,
              }
            : null,
        statistics: {
          totalGoals: game.result.totalGoals,
          bothTeamsScored: game.result.btts,
        },
        description: game.result.description || '',
      },
    };

    res.status(200).json({
      message: 'Game result retrieved successfully',
      data: detailedResult,
    });
  } catch (err) {
    console.error('Error fetching single game result:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

module.exports = {
  getAllGames,
  createGame,
  getSingleGame,
  updateGameResult,
  getGameResults,
  getSingleGameResult,
};
