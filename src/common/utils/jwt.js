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

function extractAccessToken(req) {
  const auth = req.header("Authorization");
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7).trim();
  const x = req.header("X-Access-Token");
  return x ? String(x).trim() : null;
}
function verifyAccessToken(token, secret, { clockToleranceSec = 5 } = {}) {
  try {
    return jwt.verify(token, secret, { clockTolerance: clockToleranceSec });
  } catch (e) {
    const msg =
      e.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    const err = new Error(msg);
    err.code = msg;
    throw err;
  }
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccess,
  verifyRefresh,
  ACCESS_TTL_MIN,
  REFRESH_TTL_DAY,
  extractAccessToken,
  verifyAccessToken,
};
