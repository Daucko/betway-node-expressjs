const authRoutes = require('./auth');
const gamesRoutes = require('./games');
const betsRoutes = require('./bets');
const logoutRoute = require('./logout');
const refreshRoute = require('./refresh');
const walletRoutes = require('./wallet');

const Routes = [
  authRoutes,
  gamesRoutes,
  betsRoutes,
  logoutRoute,
  refreshRoute,
  walletRoutes,
];

module.exports = Routes;
