const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log(authHeader);
  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    // Attach user info to req.user
    req.user = { id: decoded.id, _isAdmin: decoded._isAdmin };
    next();
  });
};

module.exports = verifyJWT;
