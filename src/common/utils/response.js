const StatusCode = require("../constants/statusCodes")

function success(res, data, status = StatusCode.OK) {
  return res.status(status).json({
    success: true,
    statusCode: status,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

function fail(res, message, status = StatusCode.BAD_REQUEST, extra = {}) {
  return res.status(status).json({
    success: false,
    statusCode: status,
    error: {
      message,
      ...extra,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = { success, fail };
