// middleware/auth.js
import jwt from 'jsonwebtoken';
import Member from '../models/Members.js'; // Import Member model to fetch fresh user data

export const authMiddleware = async (req, res, next) => {
  try {
    console.log('========== AUTH MIDDLEWARE ==========');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token provided or invalid format');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received (first 20 chars):', token.substring(0, 20) + '...');
    console.log('Token length:', token.length);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Fetch fresh user data from database
    console.log('Fetching user from DB with ID:', decoded.id);
    const member = await Member.findById(decoded.id);
    console.log('Member from DB:', member ? 'Found' : 'Not found');
    
    if (!member) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if account is active
    if (member.status === 'inactive' || member.status === 'suspended') {
      console.log('❌ Account not active:', member.status);
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact support.'
      });
    }

    // Attach complete user data from database to request
    req.user = {
      id: member.id,
      email: member.email,
      name: `${member.first_name} ${member.last_name}`.trim(),
      role: member.role || 'member',
      membershipNumber: member.membership_number,
      status: member.status,
      phone: member.cell_phone
    };
    
    console.log('✅ Authentication successful. User:', req.user);
    console.log('========================================');
    
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// ✅ UPDATED: Admin middleware - stricter check
export const adminMiddleware = (req, res, next) => {
  try {
    // First verify authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user has admin role (case sensitive)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required. Your role: ' + req.user.role
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// ✅ UPDATED: Trainer middleware with better logic
export const trainerMiddleware = (req, res, next) => {
  try {
    // First verify authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is admin or trainer
    if (req.user.role === 'admin' || req.user.role === 'trainer') {
      return next(); // Allow access
    }
    
    // Special case: If a trainer is accessing their own profile
    const requestedTrainerId = req.params.trainerId || req.params.id;
    if (requestedTrainerId && req.user.id.toString() === requestedTrainerId) {
      return next(); // Allow trainers to access their own profile
    }
    
    // If none of the above, deny access
    return res.status(403).json({
      success: false,
      message: 'Trainer or admin access required. Your role: ' + req.user.role
    });
    
  } catch (error) {
    console.error('Trainer middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// ✅ NEW: Role-based middleware factory (more flexible)
export const allowRoles = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
        });
      }
      
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// ✅ NEW: Optional auth middleware (doesn't error if no token)
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch fresh user data
      const member = await Member.findById(decoded.id);
      
      if (member && member.status === 'active') {
        req.user = {
          id: member.id,
          email: member.email,
          name: `${member.first_name} ${member.last_name}`.trim(),
          role: member.role || 'member',
          membershipNumber: member.membership_number,
          status: member.status
        };
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

// ✅ NEW: Check specific permission middleware
export const hasPermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Define permissions for each role
      const permissions = {
        admin: ['*'], // Admin has all permissions
        trainer: ['view_programs', 'manage_bookings', 'view_members'], // Trainer permissions
        member: ['view_own_profile', 'book_classes', 'view_programs'] // Member permissions
      };

      const userPermissions = permissions[req.user.role] || [];
      
      if (userPermissions.includes('*') || userPermissions.includes(permission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Permission denied. Required: ${permission}`
      });
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};