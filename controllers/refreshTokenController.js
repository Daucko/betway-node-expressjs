const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.status(403); // Forbidden

  // Evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
    if (err || foundUser?._id !== decoded.id) return res.sendStatus(403); // Forbidden
    const accessToken = jwt.sign(
      {
        id: foundUser?._id,
        _isAdmin: foundUser?._isAdmin,
      },
      process.env.ACCESS_TOKEN,
      { expiresIn: '5m' }
    );
    res.json({ accessToken });
  });
};

module.exports = { handleRefreshToken };
