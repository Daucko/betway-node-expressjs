const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleRegistration = async (req, res) => {
  const { username, email, password } = req.body;

  // Check for missing input
  if (!username || !email || !password)
    return res.status(400).json({
      message: 'Username, email and password are required',
    });

  // Check for the existence of user
  const duplicate = await User.findOne({ email });
  if (duplicate)
    return res
      .status(409)
      .json({ message: `User with ${email} already exist` });
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: `User ${username} created successfully`,
      user: {
        username: username,
        email: email,
        walletBallance: user?.walletBallance,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  // Check for missing input
  if (!email || !password)
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  const foundUser = await User.findOne({ email });
  if (!foundUser) return res.sendStatus(401); // Unauthorized
  // Check if the password field exists
  if (!foundUser.password) {
    return res
      .status(500)
      .json({ message: 'User password is missing in the database' });
  }
  // evaluate password
  const match = await bcrypt.compare(password, foundUser?.password);
  if (match) {
    // Create JWT
    const accessToken = jwt.sign(
      { id: foundUser?._id, _isAdmin: foundUser?._isAdmin },
      process.env.ACCESS_TOKEN,
      { expiresIn: '5m' }
    );

    const refreshToken = jwt.sign(
      { id: foundUser?._id, _isAdmin: foundUser?._isAdmin },
      process.env.REFRESH_TOKEN,
      { expiresIn: '7d' }
    );
    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    console.log(result);
    // Send the refreshToken in cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      // secure: true
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleRegistration, handleLogin };
