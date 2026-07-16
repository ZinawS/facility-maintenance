/**
 * Wraps an async route handler so rejected promises reach Express's error
 * middleware instead of crashing the process as an unhandled rejection.
 */
module.exports = function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
