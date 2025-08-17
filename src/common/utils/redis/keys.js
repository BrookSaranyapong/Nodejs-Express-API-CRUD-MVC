const NS = process.env.APP_NAMESPACE || "app";
const key = {
  session: (sid) => `${NS}:session:${sid}`,
  jtiRevoked: (jti) => `${NS}:revoked:jti:${jti}`,
};
module.exports = { key, NS };
