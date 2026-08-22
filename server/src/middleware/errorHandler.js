// Standard error shape per 06_API_SPECIFICATION.md:
// { "error": { "code", "message", "field"? } }
class ApiError extends Error {
  constructor(status, code, message, field) {
    super(message);
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, ...(err.field ? { field: err.field } : {}) },
    });
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const first = err.errors && err.errors[0];
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: first ? first.message : err.message,
        ...(first ? { field: first.path } : {}),
      },
    });
  }

  console.error(err); // eslint-disable-line no-console
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}

module.exports = { errorHandler, ApiError };
