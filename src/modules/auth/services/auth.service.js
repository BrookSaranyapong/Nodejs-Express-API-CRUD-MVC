const AuthRepository = require("../repositories/auth.repository");
const { hash, verifyHash } = require("../../../common/utils/crypto");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
  REFRESH_TTL_DAY,
} = require("../../../common/utils/jwt");
const { addDays } = require("../../../common/utils/dateTime");
const { mapUser } = require("../../../common/utils/user");

const {
  getRedis,
  setSessionAlive,
  touchSessionAlive,
  dropSession,
  revokeJti,
} = require("../../../common/utils/redis");

class AuthService {
  constructor() {
    this.repo = new AuthRepository();
  }

  async register({ email, password, name }) {
    const dup = await this.repo.findUserByEmail(email);
    if (dup) throw new Error("EMAIL_USED");
    const password_hash = await hash(password);
    const user = await this.repo.createUser({ email, password_hash, name });
    return mapUser(user);
  }

  async login({ email, password, userAgent, ip }) {
    const user = await this.repo.findUserByEmail(email);
    const valid = user && (await verifyHash(user.password_hash, password));
    if (!valid) throw new Error("INVALID_LOGIN");

    const session = await this.repo.createSession({
      user_id: user.id,
      refresh_token_hash: "temp",
      user_agent: userAgent,
      ip,
      created_at: new Date(),
      expires_at: addDays(new Date(), REFRESH_TTL_DAY),
    });

    const refreshToken = signRefreshToken({ sid: session.id, sub: user.id });
    await this.repo.updateSession(session.id, {
      refresh_token_hash: await hash(refreshToken),
    });

    const {
      token: accessToken,
      jti,
      exp,
    } = signAccessToken({
      sid: session.id,
      sub: user.id,
    });

    // cache session ตามอายุ refresh
    const redis = getRedis();
    await setSessionAlive(redis, session.id);

    return {
      user: mapUser(user),
      accessToken,
      refreshToken,
      accessExp: exp,
      sessionId: session.id,
      jti,
    };
  }

  // รีเฟรช (rotation + กัน replay)
  async refresh({ refreshToken, userAgent, ip }) {
    let payload;
    try {
      payload = verifyRefresh(refreshToken);
    } catch {
      throw new Error("INVALID_REFRESH");
    }

    const { sid, sub: userId } = payload;
    const s = await this.repo.findSessionById(sid);
    if (!s || s.user_id !== userId) throw new Error("SESSION_NOT_FOUND");
    if (s.revoked_at || new Date(s.expires_at) <= new Date())
      throw new Error("SESSION_EXPIRED");

    // กัน replay ด้วยการเทียบ hash เดิม
    const ok = await verifyHash(s.refresh_token_hash, refreshToken);
    if (!ok) {
      await this.repo.updateSession(sid, {
        revoked_at: new Date(),
        revoked_reason: "replay",
      });
      const redis = getRedis();
      await dropSession(redis, sid);
      throw new Error("REFRESH_REPLAYED");
    }

    // ออก refresh ใหม่ + อัปเดต hash/ข้อมูลอุปกรณ์
    const newRefresh = signRefreshToken({ sid, sub: userId });
    await this.repo.updateSession(sid, {
      refresh_token_hash: await hash(newRefresh),
      last_used_at: new Date(),
      user_agent: userAgent ?? s.user_agent,
      ip: ip ?? s.ip,
      // ถ้าต้องการ rolling window ให้ขยายอายุ:
      // expires_at: addDays(new Date(), REFRESH_TTL_DAY),
    });

    // ออก access ใหม่
    const {
      token: accessToken,
      jti,
      exp,
    } = signAccessToken({ sid, sub: userId });

    // ต่ออายุ cache
    const redis = getRedis();
    await touchSessionAlive(redis, sid);

    return { accessToken, refreshToken: newRefresh, accessExp: exp, jti };
  }

  // revoke access token ปัจจุบัน
  async revokeAccess({ jti, exp }) {
    const redis = getRedis();
    await revokeJti(redis, jti, exp);
    return { revoked: true };
  }

  // ออกจากเครื่องนี้
  async logout({ sessionId }) {
    await this.repo.updateSession(sessionId, {
      revoked_at: new Date(),
      revoked_reason: "logout",
    });
    const redis = getRedis();
    await dropSession(redis, sessionId);
    return { revoked: true };
  }

  // ออกจากทุกเครื่อง
  async logoutAll({ userId }) {
    await this.repo.revokeAllSessionsForUser(userId);
    const sessions = await this.repo.findAllSessionsByUser(userId);

    const redis = getRedis();
    await Promise.all(sessions.map((s) => dropSession(redis, s.id)));

    return { revokedAll: true };
  }
}

module.exports = new AuthService();
