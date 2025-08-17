const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const ACCESS_TTL_MIN = parseInt(process.env.ACCESS_TTL_MIN || "15", 10);
const REFRESH_TTL_DAY = parseInt(process.env.REFRESH_TTL_DAY || "30", 10);

function signAccessToken(payload) {
  const jti = uuidv4();
  const token = jwt.sign({ ...payload, jti }, process.env.ACCESS_SECRET, {
    expiresIn: `${ACCESS_TTL_MIN}m`,
  });
  const decoded = jwt.decode(token);
  return { token, jti, exp: decoded.exp };
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: `${REFRESH_TTL_DAY}d`,
  });
}

function verifyAccess(token) {
  return jwt.verify(token, process.env.ACCESS_SECRET);
}

function verifyRefresh(token) {
  return jwt.verify(token, process.env.REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccess,
  verifyRefresh,
  ACCESS_TTL_MIN,
  REFRESH_TTL_DAY,
};
