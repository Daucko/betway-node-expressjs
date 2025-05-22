const User = require('../models/User');

const handleLogout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
      });
    }

    // Delete refreshToken in db
    foundUser.refreshToken = '';
    const result = await foundUser.save();

    res.clearCookie('jwt', { httpOnly: true, sameSitr: 'None', secure: true });
    res.sendStatus(204); // No content
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleLogout };
