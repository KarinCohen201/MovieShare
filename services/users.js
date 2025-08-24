const jwt = require('jsonwebtoken');

function generateAccessToken({ username, email }) {
  return jwt.sign({ username, email }, process.env.TOKEN_SECRET, { expiresIn: '6000s' });
}

module.exports = { generateAccessToken };