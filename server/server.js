import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import pool from './src/database/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Session store setup
const PgSession = pgSession(session);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.APP_URL || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie']
}));

// Session middleware
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import middleware after env is configured
const { globalErrorHandler, notFound } = await import('./src/middleware/errorHandler.js');
const { apiLimiter, registrationLimiter, loginLimiter } = await import('./src/middleware/rateLimiter.js');
const { authMiddleware, adminMiddleware } = await import('./src/middleware/auth.js');

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import memberRoutes from './src/routes/members.js';
import trainerRoutes from './src/routes/trainers.js';
import serviceRoutes from './src/routes/serviceRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import membershipRoutes from './src/routes/membershipRoutes.js';
import programRoutes from './src/routes/programRoutes.js';

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// ==================== PUBLIC ROUTES ====================
// These routes have NO authentication middleware applied
// Authentication is handled internally by the route files if needed

app.use('/api/auth', authRoutes);
app.use('/api/members/register', registrationLimiter);
app.use('/api/programs', programRoutes);
app.use('/api/trainers', trainerRoutes); // REMOVED authMiddleware - trainers.js handles its own auth
app.use('/api/services', serviceRoutes); // Check if serviceRoutes has its own auth handling
app.use('/api/memberships', membershipRoutes); // Check if membershipRoutes has its own auth handling

// ==================== PROTECTED ROUTES ====================
// These routes require authentication for ALL endpoints

app.use('/api/members', authMiddleware, memberRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);

// ==================== ADMIN ROUTES ====================
// Uncomment if you have admin routes
// app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Gym Management API',
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    session: req.sessionID ? 'Session enabled' : 'No session'
  });
});

// Session test endpoint (for debugging)
app.get('/api/session-test', (req, res) => {
  res.status(200).json({
    success: true,
    sessionId: req.sessionID,
    sessionData: req.session,
    authenticated: req.session.isAuthenticated || false,
    user: req.session.user || null
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.APP_URL || 'http://localhost:3000, http://localhost:5173'}`);
  console.log(`🔐 Session storage: PostgreSQL`);
});