const bcrypt = require('bcryptjs');

async function encryptPassword(password) {
  return bcrypt.hash(password, 8);
}

module.exports = {
  encryptPassword,
};
