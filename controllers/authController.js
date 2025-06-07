const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendForgetPasswordEMail } = require('../config/sendMail');

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

    // Send verification otp to user email

    // Send a welcome greeting to the user
    const homepageUrl =
      process.env.HOMEPAGE_URL || 'https://your-app-homepage.com';
    const subject = 'Welcome to Betwise!';
    const message = `
      <h1>Hi ${username},<br><br>
      Welcome to Betwise! We're excited to have you on board.<br><br>
      Get started by visiting our homepage: <a href="${homepageUrl}">${homepageUrl}</a><br><br>
      Happy betting!<br>
      The Betwise Team</h1>
    `;
    await sendForgetPasswordEMail(email, message, subject);

    // Set user as verified if mail goes through
    user._isVerified = true;
    await user.save();

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
    // Send the refreshToken in cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      // secure: true
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({
      accessToken,
      user: { username: foundUser?.username, email: foundUser?.email },
    });
  } else {
    res.sendStatus(401);
  }
};

const handleForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(404)
      .json({ message: `User with the email ${email} not found` });
  try {
    // send email with token to the user
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: '5m',
      }
    );

    const message = `<h1>Here is the token to reset you password please click on the button,
        <a class="" href='https://www.yourcareerex.com/reset-password/${accessToken}'>Reset Password </a>
        if the button does not work for any reason, please click the link below
        <a href='https://www.yourcareerex.com/reset-password/${accessToken}'>Reset Password </a>
        </h1>`;
    const subject = 'Reset Password';
    await sendForgetPasswordEMail(email, message, subject);
    res.status(200).json({ message: 'Please check your email inbox' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server issues' });
  }
};

const handleResetPassword = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: 'User account not found!' });

  const hashedPassword = bcrypt.hash(password, 12);
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({ message: 'Password reset successful' });
};

module.exports = {
  handleRegistration,
  handleLogin,
  handleForgotPassword,
  handleResetPassword,
};
