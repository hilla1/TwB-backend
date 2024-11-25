export const errorHandler = (err, req, res, next) => {
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Log the error details
  console.error('Error Stack:', err.stack);
  console.error('Error Message:', err.message);
  console.error('Request Method:', req.method);
  console.error('Request URL:', req.url);
  
  // Determine the type of error and respond accordingly
  let statusCode = err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'UnauthorizedError') {
    // JWT-specific errors
    statusCode = 401;
    message = 'Invalid or expired token';
  } else if (err.name === 'JsonWebTokenError') {
    // JWT errors
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // JWT token expired
    statusCode = 401;
    message = 'Token has expired';
  } else if (err.type === 'session' && err.message === 'Session not found') {
    // Session-specific errors
    statusCode = 401;
    message = 'Session not found or expired';
  } else if (err.name === 'ValidationError') {
    // Validation errors
    statusCode = 400;
    message = 'Validation failed';
  } else if (err.name === 'NotFoundError') {
    // Not found errors
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.name === 'MongoServerError') {
    // MongoDB server errors
    statusCode = 500;
    message = 'Database error occurred';
  } else if (err.name === 'TypeError') {
    // Type errors, often due to unexpected data types
    statusCode = 400;
    message = 'Type error occurred';
  } else if (err.message.includes('Invalid ObjectId format')) {
    // Specific MongoDB ObjectId format error
    statusCode = 400;
    message = 'Invalid ObjectId format';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    error: err.message
  });
};
