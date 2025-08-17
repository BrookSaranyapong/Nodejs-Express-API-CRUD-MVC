const AuthRepository = require("../repositories/auth.repository");
const { hash, verifyHash } = require("../../../common/utils/crypto");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
  REFRESH_TTL_DAY,
} = require("../../../common/utils/jwt");
const { addDays } = require("../../../common/utils/date");
const { redis } = require("../../../redis/redis");

class AuthService {
  constructor() {
    this.repo = new AuthRepository();
  }

  // สมัครสมาชิก
  async register(data) {
    const dup = await this.repo.findUserByEmail(data.email);
    if (dup) throw new Error("EMAIL_USED");
    const password_hash = await hash(data.password);
    const user = await this.repo.createUser({
      email: data.email,
      password_hash,
      name: data.name,
    });
    return { id: user.id, email: user.email, name: user.name };
  }

  // ล็อกอิน -> ออก token + สร้าง session
  async login({ email, password, userAgent, ip }) {
    const user = await this.repo.findUserByEmail(email);
    if (!user || !(await verifyHash(user.password_hash, password))) {
      throw new Error("INVALID_LOGIN");
    }

    // สร้าง session (hash ไว้ทีหลัง)
    const session = await this.repo.createSession({
      user_id: user.id,
      refresh_token_hash: "temp",
      user_agent: userAgent,
      ip,
      created_at: new Date(),
      expires_at: addDays(new Date(), REFRESH_TTL_DAY),
    });

    // ออก refresh + เก็บ hash
    const refreshToken = signRefreshToken({ sid: session.id, sub: user.id });
    await this.repo.updateSession(session.id, {
      refresh_token_hash: await hash(refreshToken),
    });

    // ออก access
    const {
      token: accessToken,
      jti,
      exp,
    } = signAccessToken({
      sid: session.id,
      sub: user.id,
    });

    // Redis: ทำ session alive ตามอายุ refresh
    await redis.set(
      `session:${session.id}`,
      "active",
      "EX",
      REFRESH_TTL_DAY * 24 * 60 * 60
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
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

    const ok = await verifyHash(s.refresh_token_hash, refreshToken);
    if (!ok) {
      await this.repo.updateSession(sid, {
        revoked_at: new Date(),
        revoked_reason: "replay",
      });
      await redis.del(`session:${sid}`);
      throw new Error("REFRESH_REPLAYED");
    }

    // หมุน refresh ใหม่ + อัปเดต hash
    const newRefresh = signRefreshToken({ sid, sub: userId });
    await this.repo.updateSession(sid, {
      refresh_token_hash: await hash(newRefresh),
      last_used_at: new Date(),
      user_agent: userAgent ?? s.user_agent,
      ip: ip ?? s.ip,
      // ถ้าต้องการ rolling window:
      // expires_at: addDays(new Date(), REFRESH_TTL_DAY),
    });

    // ออก access ใหม่
    const {
      token: accessToken,
      jti,
      exp,
    } = signAccessToken({
      sid,
      sub: userId,
    });

    // ต่ออายุคีย์ Redis ของ session
    await redis.expire(`session:${sid}`, REFRESH_TTL_DAY * 24 * 60 * 60);

    return { accessToken, refreshToken: newRefresh, accessExp: exp, jti };
  }

  // revoke access token ปัจจุบัน (เดี๋ยวนี้)
  async revokeAccess({ jti, exp }) {
    const now = Math.floor(Date.now() / 1000);
    const ttl = Math.max(0, (exp || 0) - now);
    if (ttl > 0) await redis.set(`revoked:jti:${jti}`, "1", "EX", ttl);
    return { revoked: true };
  }

  // ออกจากเครื่องนี้
  async logout({ sessionId }) {
    await this.repo.updateSession(sessionId, {
      revoked_at: new Date(),
      revoked_reason: "logout",
    });
    await redis.del(`session:${sessionId}`);
    return { revoked: true };
  }

  // ออกจากทุกเครื่อง
  async logoutAll({ userId }) {
    await this.repo.revokeAllSessionsForUser(userId);
    const sessions = await this.repo.findAllSessionsByUser(userId);
    const keys = sessions.map((s) => `session:${s.id}`);
    if (keys.length) await redis.del(keys);
    return { revokedAll: true };
  }
}

module.exports = new AuthService();
