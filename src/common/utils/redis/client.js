const Redis = require("ioredis");
let client;

function getRedis() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });
    client.on("error", (e) => console.error("[redis]", e.message));
  }
  return client;
}

async function closeRedis() {
  if (!client) return;
  try {
    await client.quit();
  } catch {
    client.disconnect();
  }
  client = null;
}

module.exports = { getRedis, closeRedis };
