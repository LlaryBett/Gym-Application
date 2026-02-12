// C:\Users\pc\Gym Application\server\src\utils\logger.js
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format (pretty print for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'gym-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Write audit logs to separate file
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      level: 'audit',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Custom log levels for different purposes
export const log = {
  /**
   * Info level logging
   */
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },
  
  /**
   * Error level logging
   */
  error: (message, error = null, meta = {}) => {
    if (error instanceof Error) {
      meta.stack = error.stack;
      meta.errorMessage = error.message;
    }
    logger.error(message, meta);
  },
  
  /**
   * Warning level logging
   */
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },
  
  /**
   * Debug level logging
   */
  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },
  
  /**
   * Audit logging (for important actions)
   */
  audit: (action, userId, details = {}) => {
    logger.log('audit', {
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...details
    });
  },
  
  /**
   * HTTP request logging
   */
  http: (req, res, responseTime) => {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user ? req.user.id : 'anonymous'
    };
    
    // Log differently based on status code
    if (res.statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl}`, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl}`, meta);
    } else {
      logger.info(`${req.method} ${req.originalUrl}`, meta);
    }
  },
  
  /**
   * Database query logging
   */
  db: (query, params, duration) => {
    logger.debug('Database query', {
      query,
      params,
      duration: `${duration}ms`
    });
  }
};

/**
 * Morgan stream for Winston integration
 */
export const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

export default logger;