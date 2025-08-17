const StatusCodes = require("../constants/statusCodes");

/**
 * Success response
 * @param {Response} res - express response object
 * @param {any} data - payload
 * @param {number} status - HTTP status code (default = 200)
 */
function success(res, data, status = StatusCodes.OK) {
  return res.status(status).json({
    success: true,
    statusCode: status,
    data,
  });
}

/**
 * Fail response
 * @param {Response} res - express response object
 * @param {string} message - error message
 * @param {number} status - HTTP status code (default = 400)
 */
function fail(res, message, status = StatusCodes.BAD_REQUEST) {
  return res.status(status).json({
    success: false,
    statusCode: status,
    error: { message },
  });
}

module.exports = { success, fail };
