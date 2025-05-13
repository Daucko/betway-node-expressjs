const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  homeTeam: {
    type: String,
    required: [true, 'Please add home team name'],
  },
  awayTeam: {
    type: String,
    required: [true, 'Please add away team name'],
  },
  sport: {
    type: String,
    required: [true, 'Please specify the sport'],
  },
  startTime: {
    type: Date,
    required: [true, 'Please add game start time'],
  },
  odds: {
    // Basic match outcome odds
    homeWin: {
      type: Number,
      required: [true, 'Please add home win odds'],
    },
    awayWin: {
      type: Number,
      required: [true, 'Please add away win odds'],
    },
    draw: {
      type: Number,
      default: null, // Optional for sports without draws
    },

    // Goals related odds
    over15: {
      type: Number,
      default: null,
    },
    under15: {
      type: Number,
      default: null,
    },
    over25: {
      type: Number,
      default: null,
    },
    under25: {
      type: Number,
      default: null,
    },
    over35: {
      type: Number,
      default: null,
    },
    under35: {
      type: Number,
      default: null,
    },

    // Both teams to score
    bttsYes: {
      type: Number,
      default: null,
    },
    bttsNo: {
      type: Number,
      default: null,
    },

    // Double chance
    homeWinOrDraw: {
      type: Number,
      default: null,
    },
    homeWinOrAwayWin: {
      type: Number,
      default: null,
    },
    awayWinOrDraw: {
      type: Number,
      default: null,
    },

    // Correct score (most common scores only)
    correctScore: {
      type: Map,
      of: Number,
      default: new Map(),
    },

    // Half time/Full time
    halfTimeFullTime: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'finished', 'canceled'],
    default: 'scheduled',
  },
  result: {
    // Basic match outcome result
    outcome: {
      type: String,
      enum: ['homeWin', 'awayWin', 'draw', null],
      default: null,
    },

    // Additional results
    homeScore: {
      type: Number,
      default: null,
    },
    awayScore: {
      type: Number,
      default: null,
    },

    // Additional result flags
    totalGoals: {
      type: Number,
      default: null,
    },
    btts: {
      type: Boolean,
      default: null,
    },

    // Half time score
    halfTimeHomeScore: {
      type: Number,
      default: null,
    },
    halfTimeAwayScore: {
      type: Number,
      default: null,
    },

    description: String,
  },
});

module.exports = new mongoose.model('Game', gameSchema);
