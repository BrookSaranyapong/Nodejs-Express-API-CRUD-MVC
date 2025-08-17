async function redisHealth(redis) {
  try {
    return (await redis.ping()) === "PONG";
  } catch {
    return false;
  }
}
module.exports = { redisHealth };
