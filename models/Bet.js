const mongoose = require('mongoose');
const userSchema = mongoose.Schema;

const betSchema = new Schema(
  {
    // User who placed the bet
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    // Game the bet is placed on
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: [true, 'Game ID is required'],
    },

    // Outcome/prediction the user is betting on
    outcome: {
      type: {
        type: String,
        enum: [
          // Match outcomes
          'homeWin',
          'awayWin',
          'draw',

          // Goals
          'over15',
          'under15',
          'over25',
          'under25',
          'over35',
          'under35',

          // Both teams to score
          'bttsYes',
          'bttsNo',

          // Double chance
          'homeWinOrDraw',
          'homeWinOrAwayWin',
          'awayWinOrDraw',

          // Correct score
          'correctScore',

          // Half time/Full time
          'halfTimeFullTime',
        ],
        required: [true, 'Bet outcome type is required'],
      },

      // For specialized bets like correct score or HT/FT
      value: {
        type: String,
        default: null,
      },

      // Odds at the time of placing bet
      odds: {
        type: Number,
        required: [true, 'Bets odds are required'],
        min: [1.01, 'Minimum odds must be at least 1.01'],
      },
    },

    // Financial details
    stake: {
      type: Number,
      required: [true, 'Stake amount is required'],
      min: [10, 'Minimum stake is 1'],
    },

    // Payout details
    payout: {
      potential: {
        type: Number,
        required: [true, 'Potential payout must be calculated'],
      },
      actual: {
        type: Number,
        default: 0,
      },
    },

    // Bet status tracking
    status: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);
