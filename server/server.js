import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './src/database/db.js';
import redisClient from './src/config/redis.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
  origin: [
    process.env.APP_URL || 'http://localhost:5173',
    'https://gym-application-sooty.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware - IMPORTANT: Raw body for webhooks BEFORE JSON parsing
app.use('/api/memberships/webhook', express.raw({type: 'application/json'}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import middleware after env is configured
const { globalErrorHandler, notFound } = await import('./src/middleware/errorHandler.js');
const { apiLimiter, registrationLimiter, loginLimiter } = await import('./src/middleware/rateLimiter.js');
const { authMiddleware, adminMiddleware } = await import('./src/middleware/auth.js');
const { checkTrialExpiry } = await import('./src/middleware/trialMiddleware.js');

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import memberRoutes from './src/routes/members.js';
import trainerRoutes from './src/routes/trainers.js';
import serviceRoutes from './src/routes/serviceRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import membershipRoutes from './src/routes/membershipRoutes.js';
import programRoutes from './src/routes/programRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import cardRoutes from './src/routes/cardRoutes.js'; // ✅ NEW: Card routes

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// ==================== CONNECT TO REDIS ====================
try {
  await redisClient.connect();
  console.log('✅ Redis connected successfully');
} catch (error) {
  console.error('❌ Redis connection failed:', error);
}

// ==================== PUBLIC ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/members/register', registrationLimiter);
app.use('/api/programs', programRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/chat', chatRoutes);

// ==================== PROTECTED ROUTES WITH JWT ====================
app.use('/api/members', authMiddleware, checkTrialExpiry, memberRoutes);
app.use('/api/bookings', authMiddleware, checkTrialExpiry, bookingRoutes);
app.use('/api/cards', authMiddleware, cardRoutes); // ✅ NEW: Card routes (protected)

// Program routes that need protection
app.post('/api/programs/enroll', authMiddleware, checkTrialExpiry, (req, res, next) => {
  req.url = '/enroll';
  programRoutes(req, res, next);
});

app.get('/api/programs/my-enrollments', authMiddleware, checkTrialExpiry, (req, res, next) => {
  req.url = '/my-enrollments';
  programRoutes(req, res, next);
});

app.get('/api/programs/my/saved', authMiddleware, checkTrialExpiry, (req, res, next) => {
  req.url = '/my/saved';
  programRoutes(req, res, next);
});

app.post('/api/programs/:id/save', authMiddleware, checkTrialExpiry, (req, res, next) => {
  programRoutes(req, res, next);
});

app.delete('/api/programs/:id/save', authMiddleware, checkTrialExpiry, (req, res, next) => {
  programRoutes(req, res, next);
});

// ==================== MEMBERSHIP ROUTES ====================
app.post('/api/memberships/purchase', authMiddleware, (req, res, next) => {
  req.url = '/purchase';
  membershipRoutes(req, res, next);
});

app.get('/api/memberships/my-membership', authMiddleware, (req, res, next) => {
  req.url = '/my-membership';
  membershipRoutes(req, res, next);
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Gym Management API',
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Token verification
app.get('/api/verify-token', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user
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
  console.log(`🌐 CORS enabled for: ${process.env.APP_URL || 'http://localhost:5173, https://gym-application-sooty.vercel.app'}`);
  console.log(`🔐 JWT Authentication enabled`);
  console.log(`💬 Chat service enabled with Redis`);
  console.log(`💳 Card service enabled`); // ✅ NEW: Card service log
});

// Redis test endpoint
app.get('/api/test-redis', async (req, res) => {
  try {
    const redis = redisClient.getClient();
    await redis.set('test-key', 'PowerGym Redis is working!');
    const value = await redis.get('test-key');
    await redis.expire('test-key', 60);
    
    res.json({
      success: true,
      message: 'Redis connection successful!',
      data: {
        value,
        connection: 'Upstash',
        status: redisClient.isConnected() ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({
      success: false,
      message: 'Redis connection failed',
      error: error.message
    });
  }
});