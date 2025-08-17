const { models } = require("../../../configs/db");

class AuthRepository {
  constructor() {
    this.User = models._User;
    this.Session = models._Session;
    this.AccessTokenBlacklist = models._AccessTokenBlacklist;
  }

  // Users
  findUserByEmail(email) {
    return this.User.findOne({ where: { email } });
  }
  createUser(data) {
    return this.User.create(data);
  }

  // Sessions
  createSession(data) {
    return this.Session.create(data);
  }
  updateSession(id, data) {
    return this.Session.update(data, { where: { id } });
  }
  findSessionById(id) {
    return this.Session.findByPk(id);
  }
  findAllSessionsByUser(userId) {
    return this.Session.findAll({ where: { user_id: userId } });
  }
  async revokeAllSessionsForUser(userId) {
    await this.Session.update(
      { revoked_at: new Date(), revoked_reason: "logout_all" },
      { where: { user_id: userId, revoked_at: null } }
    );
  }

  addToBlacklist(data) {
    return this.AccessTokenBlacklist.create(data);
  }
}

module.exports = AuthRepository;
