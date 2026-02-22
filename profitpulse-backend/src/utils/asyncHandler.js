/**
 * Wrapper for async route handlers to pass unhandled errors to the global error middleware
 * without writing try-catch in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
