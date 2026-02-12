// Authentication middleware
export const authMiddleware = (req, res, next) => {
  if (!req.session || !req.session.isAuthenticated || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
};

// Admin middleware
export const adminMiddleware = (req, res, next) => {
  if (!req.session || !req.session.isAuthenticated || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Check if user has admin role (you need to add role to your user model)
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  
  next();
};


// Trainer middleware
export const trainerMiddleware = (req, res, next) => {
    if (!req.session || !req.session.isAuthenticated || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    // Check if user is a trainer or admin
    const isTrainer = req.session.user.role === 'trainer';
    const isAdmin = req.session.user.role === 'admin';
    
    // If accessing their own trainer bookings
    const isOwnTrainerProfile = req.params.trainerId && 
                               req.session.user.id.toString() === req.params.trainerId;
    
    if (!isAdmin && !isTrainer && !isOwnTrainerProfile) {
        return res.status(403).json({
            success: false,
            message: 'Trainer access required'
        });
    }
    
    next();
};