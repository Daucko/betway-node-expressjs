const Game = require('../models/Game');
const Bet = require('../models/Bet');
const User = require('../models/User');

const getAllBets = async (req, res) => {
  try {
    // Build query based on user
    const user = req.user.id;
    const query = { user: user };

    // Filter by status if provided (pending, won, lost, voided, cancelled)
    if (
      req.query.status &&
      ['pending', 'won', 'lost', 'voided', 'cancelled'].includes(
        req.query.status
      )
    ) {
      query.status = req.query.status;
    }
    // Filter by game if provided
    if (req.query.gameId) {
      query.game = req.query.gameId;
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);

      // Check for valid dates
      if (!isNaN(startDate) && !isNaN(endDate)) {
        query.settledAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }
    }

    //   Pagination setup
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Execute the query with pagination and populate game details
    const bets = await Bet.find(query)
      .populate({
        path: 'game',
        select: 'homeTeam awayTeam sport startTime status result',
      })
      .sort({ createdAt: -1 }) // Sort by most recent
      .skip(startIndex)
      .limit(limit);

    // Get pagination total count
    const total = await Bet.countDocuments(query);

    const stats = null;

    if (req.query.includeStats === 'true') {
      const allUserBets = await Bet.find({ user });

      // Calculate win/loss statistics
      const totalBets = allUserBets.length;
      const wonBets = allUserBets.filter((bet) => bet.status === 'won').length;
      const lostBets = allUserBets.filter(
        (bet) => bet.status === 'lost'
      ).length;
      const pendingBets = allUserBets.filter(
        (bet) => bet.status === 'pending'
      ).length;

      // Calculate profit/loss
      const totalStaked = allUserBets.reduce((sum, bet) => sum + bet.stake, 0);
      const totalWon = allUserBets
        .filter((bet) => bet.status === 'won')
        .reduce((sum, bet) => sum + bet.payout.actual, 0);

      stats = {
        totalBets,
        wonBets,
        lostBets,
        pendingBets,
        winRate:
          totalBets > 0
            ? ((wonBets / (wonBets + lostBets)) * 100).toFixed(2)
            : 0,
        totalStaked,
        totalWon,
        profitLoss: totalWon - totalStaked,
      };
    }

    res.status(200).json({
      count: bets.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      stats,
      data: bets,
    });
  } catch (err) {
    console.error('Error fetching bets:', err);

    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

const placeNewBet = async (req, res) => {
  try {
    const { gameId, outcomeType, outcomeValue, stake } = req.body;

    // Validate required fields
    if (!gameId || !outcomeType || !stake)
      return res
        .status(400)
        .json({ message: 'Please provide gameId, outcomeType and stake' });

    // Validate stake amount
    if (stake <= 0)
      return res
        .status(400)
        .json({ message: 'Stake amount must be greater than 0' });

    // Get game
    const game = await Game.findById(gameId);

    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Check if game is open for betting
    if (game.status !== 'scheduled')
      return res.status(400).json({ message: 'Game is not open for betting' });

    // Check whether the game has already started
    if (new Date(game.startTime) <= new Date())
      return res.status(400).json({ message: 'This gane has already started' });

    // Get the odd of the selected game
    let betOdds;

    // Betting odds logic base on the type
    switch (outcomeType) {
      // Match outcomes
      case 'homeWin':
        betOdds = game.odds.homeWin;
        break;
      case 'awayWin':
        betOdds = game.odds.awayWin;
        break;
      case 'draw':
        betOdds = game.odds.draw;
        break;

      // Goals
      case 'over 15':
        betOdds = game.odds.over15;
        break;
      case 'under 15':
        betOdds = game.odds.under15;
        break;
      case 'over 25':
        betOdds = game.odds.over25;
        break;
      case 'under 25':
        betOdds = game.odds.under25;
        break;
      case 'over 35':
        betOdds = game.odds.over35;
        break;
      case 'under 35':
        betOdds = game.odds.under35;
        break;

      // Both teams to score
      case 'bttsYes':
        betOdds = game.odds.bttsYes;
        break;
      case 'bttsNo':
        betOdds = game.odds.bttsNo;
        break;

      // Double chance
      case 'homeWinOrDraw':
        betOdds = game.odds.homeWinOrDraw;
        break;
      case 'homeWinOrAwayWin':
        betOdds = game.odds.homeWinOrAwayWin;
        break;
      case 'awayWinOrDraw':
        betOdds = game.odds.awayWinOrDraw;
        break;

      // Special bets that need additional value parameter
      case 'correctScore':
        if (!outcomeValue)
          return res
            .status(400)
            .json({ message: 'Please provide a correct score value' });
        betOdds = game.odds.correctScore.get(outcomeValue);
        break;

      case 'halfTimeFullTime':
        if (!outcomeValue)
          return res
            .status(400)
            .json({ message: 'Half time/Full time value is required' });
        betOdds = game.odds.haltTimeFullTime.get(outcomeValue);
        break;

      default:
        return res.status(400).json({ message: 'Invalid bet type' });
    }

    // Verify odds are available for this bet
    if (!betOdds)
      return res.status(400).json({
        message: `${outcomeType} betting is not available for this game`,
      });

    // Check user wallet ballance
    const user = await User.findById(req.user.id);

    if (user.wallet.balance < stake)
      return res
        .status(400)
        .json({ message: 'Insufficient funds in your wallet' });

    // Calculate potential payout
    const potentialPayout = parseFloat((stake * betOdds).toFixed(2));

    // Create new bet
    const bet = await Bet.create({
      user: req.user.id,
      game: gameId,
      outcome: {
        type: outcomeType,
        value: outcomeValue || null,
        odds: betOdds,
      },
      stake,
      payout: {
        potential: potentialPayout,
        actual: 0,
      },
      status: 'pending',
    });

    // Update user wallet
    user.wallet.ballance -= stake;

    // Add transaction to user wallet
    user.wallet.transactions.push({
      type: 'bet',
      amount: -stake,
      description: `${outcomeType} bet on ${game.homeTeam} vs ${game.awayTeam}`,
    });

    await user.save();

    // Populate game details in the bet response
    const populatedBet = await Bet.findById(bet._id).populate(
      'game',
      'homeTeam awayTeam sport startTime'
    );

    res.status(201).json({
      message: 'Bet placed successfully',
      data: populatedBet,
    });
  } catch (err) {
    console.log('Error placing bet:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllBets, placeNewBet };
