const Game = require('../models/Game');
const Bet = require('../models/Bet');
const User = require('../models/User');

const getWalletInfo = async (req, res) => {
  try {
    // Find the user and select only wallet-related fields
    const user = await User.findById(req.user.id).select('wallet');

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Optional filtering by transaction type
    let transactions = user.wallet.transactions;

    if (
      req.query.type &&
      ['deposit', 'withrawal', 'bet', 'win'].includes(req.query.type)
    ) {
      transactions = transactions.filter((t) => t.type === req.query.type);
    }

    // Optional date range filtering
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);

      // Ensure dates are valid
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        transactions = transactions.filter((t) => {
          const txDate = new Date(t.createdAt);
          return txDate >= startDate && txDate <= endDate;
        });
      }
    }

    // Sort transactions by date (newest first)
    transactions = transactions.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Optional pagination
    let paginatedTransactions = transactions;
    let pagination = null;

    if (req.query.page && req.query.limit) {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      paginatedTransactions = transactions.slice(startIndex, endIndex);

      pagination = {
        total: transactions.length,
        page,
        pages: Math.ceil(transactions.length / limit),
      };
    }

    // Calculate statistics if requested
    let stats = null;

    if (req.query.includeStats === 'true') {
      const deposits = transactions
        .filter((t) => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);

      const withdrawals = transactions
        .filter((t) => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);

      const betAmounts = transactions
        .filter((t) => t.type === 'bet')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const winnings = transactions
        .filter((t) => t.type === 'win')
        .reduce((sum, t) => sum + t.amount, 0);

      stats = {
        deposits,
        withdrawals,
        betAmounts,
        winnings,
        profitLoss: winnings - betAmounts,
      };
    }

    res.status(200).json({
      data: {
        balance: user.wallet.balance,
        transactions: paginatedTransactions,
        pagination,
        stats,
      },
    });
  } catch (err) {
    console.error('Error fetching wallet:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

const getWalletTransactions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wallet.transactions');

    if (!user) return res.status(404).json({ message: 'User not found' });

    let transactions = user.wallet.transactions;

    // Filter by transaction type if provided
    if (
      req.query.type &&
      ['deposit', 'withdrawal', 'bet', 'win'].includes(req.query.type)
    ) {
      transactions = transactions.filter((t) => t.type === req.query.type);
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        transactions = transactions.filter((t) => {
          const txDate = new Date(t.createdAt);
          return txDate >= startDate && txDate <= endDate;
        });
      }
    }

    // Sort transactions by date (newest first)
    transactions = transactions.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.status(200).json({
      count: transactions.length,
      pagination: {
        total: transactions.length,
        page,
        pages: Math.ceil(transactions.length / limit),
      },
      data: paginatedTransactions,
    });
  } catch (err) {
    console.error('Error fetching wallet transactions:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wallet.balance');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ balance: user.wallet.balance });
  } catch (err) {
    console.error('Error fetching wallet balance:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

module.exports = { getWalletInfo, getWalletTransactions, getWalletBalance };
