const dayToMs = (d) => d * 24 * 60 * 60 * 1000;

const addDays = (date, n) => new Date(date.getTime() + dayToMs(n));

const secondsUntil = (expiresAt) =>
  Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);

module.exports = { dayToMs, addDays, secondsUntil };
