const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEMail } = require('../config/sendMail');
const otpGenerator = require('otp-generator');
const Otp = require('../models/Otp');

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

    // Send a welcome greeting to the user with a verification link
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN,
      { expiresIn: '1d' }
    );
    const baseUrl = process.env.BASE_URL || 'https://your-app-base.com';
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
    const subject = 'Welcome to Betwise! Please verify your email';
    const message = `
      <h1>Hi ${username},<br><br>
      Welcome to Betwise! We're excited to have you on board.<br><br>
      Please verify your email by clicking the link below:<br>
      <a href="${verificationUrl}">Verify Email</a><br><br>
      Or copy and paste this link into your browser:<br>
      ${verificationUrl}<br><br>
      Happy betting!<br>
      The Betwise Team</h1>
    `;
    await sendEMail(email, message, subject);

    res.status(201).json({
      message: `User ${username} created successfully. Please check your email to verify your account.`,
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
    // Generate a 6-digit numeric OTP using otp-generator
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    // Store OTP in the database with expiry (5 minutes)
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      used: false,
    });
    const message = `<h1>Your password reset OTP is: <strong>${otp}</strong></h1>
      <p>This OTP is valid for 5 minutes. If you did not request a password reset, please ignore this email.</p>`;
    const subject = 'Password Reset OTP';
    await sendEMail(email, message, subject);
    res.status(200).json({ message: 'OTP sent to your email address' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server issues' });
  }
};

const handleResetPassword = async (req, res) => {
  if (!req.body || !req.body.email || !req.body.password || !req.body.otp) {
    return res
      .status(400)
      .json({ message: 'Email, password, and OTP are required.' });
  }
  const { email, password, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: 'User account not found!' });

  // Verify OTP from database
  const otpDoc = await Otp.findOne({ email, otp, used: false });
  if (!otpDoc || otpDoc.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  otpDoc.used = true;
  await otpDoc.save();

  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({ message: 'Password reset successful' });
};

const handleVerifyEmail = async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ message: 'Verification token is required.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user._isVerified) {
      return res.status(200).json({ message: 'Email already verified.' });
    }
    user._isVerified = true;
    await user.save();
    // Optionally, redirect to homepage or show a success message
    return res
      .status(200)
      .json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    return res
      .status(400)
      .json({ message: 'Invalid or expired verification token.' });
  }
};

module.exports = {
  handleRegistration,
  handleLogin,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyEmail,
};
