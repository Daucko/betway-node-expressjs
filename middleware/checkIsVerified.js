const User = require('../models/User');

// Middleware to check if user is verified
const checkIsVerified = async (req, res, next) => {
  try {
    // Accept email from body for login/forgot/reset
    const email = req.body.email;
    if (!email) {
      return res
        .status(400)
        .json({ message: 'Email is required for verification check.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (!user._isVerified) {
      return res
        .status(403)
        .json({
          message:
            'Account not verified. Please check your email for verification.',
        });
    }
    next();
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Server error during verification check.' });
  }
};

module.exports = checkIsVerified;
