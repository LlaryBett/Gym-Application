// C:\Users\pc\Gym Application\server\src\middleware\errorHandler.js

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found error handler
 */
export const notFound = (req, res, next) => {
  const error = new AppError(`Cannot find ${req.originalUrl} on this server!`, 404);
  next(error);
};

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for development
  if (process.env.NODE_ENV === 'development') {
    console.error('💥 ERROR 💥', {
      status: err.status,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params
    });
  }

  // Handle database errors
  if (err.code === '23505') { // PostgreSQL unique violation
    err.statusCode = 409;
    err.message = 'Duplicate entry. This record already exists.';
  } else if (err.code === '23503') { // Foreign key violation
    err.statusCode = 400;
    err.message = 'Related record not found.';
  } else if (err.code === '23502') { // Not null violation
    err.statusCode = 400;
    err.message = 'Required field is missing.';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid token. Please log in again.';
  }
  
  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Your token has expired. Please log in again.';
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    const messages = Object.values(err.errors).map(val => val.message);
    err.message = `Validation failed: ${messages.join('. ')}`;
  }

  // Handle multer errors (file upload)
  if (err.name === 'MulterError') {
    err.statusCode = 400;
    err.message = `File upload error: ${err.message}`;
  }

  // Response for development
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  } else {
    // Production response (hide error details)
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message
      });
    } else {
      // Programming or unknown errors: don't leak error details
      console.error('💥 UNEXPECTED ERROR 💥', err);
      
      res.status(500).json({
        success: false,
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
};

/**
 * Async error wrapper (eliminates try-catch blocks in controllers)
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Database connection error handler
 */
export const handleDatabaseError = (error, req, res, next) => {
  if (error.code === 'ECONNREFUSED') {
    console.error('Database connection refused. Please check if PostgreSQL is running.');
    return res.status(503).json({
      success: false,
      message: 'Service unavailable. Database connection error.'
    });
  }
  
  if (error.code === 'ETIMEDOUT') {
    console.error('Database connection timeout.');
    return res.status(504).json({
      success: false,
      message: 'Gateway timeout. Database connection failed.'
    });
  }
  
  next(error);
};