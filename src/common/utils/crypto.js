const argon2 = require("argon2");

async function hash(value) {
  return argon2.hash(value, { type: argon2.argon2id });
}

async function verifyHash(hashValue, plainValue) {
  return argon2.verify(hashValue, plainValue);
}

module.exports = { hash, verifyHash };
