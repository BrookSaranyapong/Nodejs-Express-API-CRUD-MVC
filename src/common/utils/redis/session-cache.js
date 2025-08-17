const { key } = require("./keys");
const REFRESH_TTL_SEC =
  (Number(process.env.REFRESH_TTL_DAY) || 7) * 24 * 60 * 60;

const setSessionAlive = (redis, sid, ttl = REFRESH_TTL_SEC) =>
  redis.set(key.session(sid), "active", "EX", ttl);

const touchSessionAlive = (redis, sid, ttl = REFRESH_TTL_SEC) =>
  redis.expire(key.session(sid), ttl);

const dropSession = (redis, sid) => redis.del(key.session(sid));

const isJtiRevoked = async (redis, jti) =>
  Boolean(await redis.get(key.jtiRevoked(jti)));

const revokeJti = async (redis, jti, expUnix) => {
  const now = Math.floor(Date.now() / 1000);
  const ttl = Math.max(0, (expUnix || 0) - now);
  if (ttl > 0) await redis.set(key.jtiRevoked(jti), "1", "EX", ttl);
};

async function ensureSessionAlive(redis, SessionModel, sid) {
  // 1) เช็ค cache ก่อน
  try {
    if (await redis.get(key.session(sid))) return true;
  } catch {} // ignore redis error

  // 2) ตกมาที่ DB
  let s;
  try {
    s = await SessionModel.findByPk(sid);
  } catch {
    return false;
  }

  const now = Date.now();
  if (!s) return false;
  if (s.revoked_at) return false;

  const expMs = new Date(s.expires_at).getTime();
  if (expMs <= now) return false;

  // 3) warm cache กลับ พร้อม TTL ที่เหลือ
  const ttl = Math.max(0, Math.floor((expMs - now) / 1000));
  if (ttl > 0) {
    try { await redis.set(key.session(sid), "active", "EX", ttl); } catch {}
  }
  return true;
}

module.exports = {
  setSessionAlive,
  touchSessionAlive,
  dropSession,
  isJtiRevoked,
  revokeJti,
  ensureSessionAlive, // ✅ export เพิ่ม
};