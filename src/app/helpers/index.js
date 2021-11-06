const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function encryptPassword(password) {
  return bcrypt.hash(password, 8);
}

async function compareHashes(password, hash) {
  return bcrypt.compare(password, hash);
}

async function generateToken(user) {
  return jwt.sign(
    { userId: user.id, isAdmin: user.is_admin },
    process.env.APP_SECRET,
  );
}

module.exports = {
  encryptPassword,
  compareHashes,
  generateToken,
};
