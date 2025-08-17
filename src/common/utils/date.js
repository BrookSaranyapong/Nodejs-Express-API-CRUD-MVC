const dayToMs = (d) => d * 24 * 60 * 60 * 1000;
const addDays = (date, n) => new Date(date.getTime() + dayToMs(n));

module.exports = { dayToMs, addDays };
