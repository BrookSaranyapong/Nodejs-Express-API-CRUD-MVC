const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null, // ป้องกัน error กับบางไลบรารี
});

redis.on("error", (e) => console.error("[redis] error:", e.message));
redis.on("connect", () => console.log("[redis] connected"));

module.exports = { redis };
