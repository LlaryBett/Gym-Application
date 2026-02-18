import Member from '../models/Members.js';
import { memberSchemas } from '../utils/validation.js';

// Register new member (public route)
export const registerMember = async (req, res) => {
  try {
    // Validate request data using the Joi schema
    const { error, value } = memberSchemas.registration.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Get validated and cleaned data
    const validatedData = value;

    // Check if email already exists
    const existingMember = await Member.findByEmail(validatedData.email);
    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new member with validated data
    const member = await Member.create(validatedData);
    
    // Format response data
    const responseData = {
      id: member.id,
      membershipNumber: member.membership_number,
      name: `${member.first_name} ${member.last_name}`.trim(),
      email: member.email,
      phone: member.cell_phone,
      status: member.status,
      createdAt: member.created_at
    };
    
    res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      data: {
        member: responseData,
        nextSteps: [
          'We will review your application within 24 hours',
          'Our team will contact you to schedule an orientation',
          'Complete payment to activate your membership'
        ]
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint === 'members_email_key') {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login with email and membership number
export const login = async (req, res) => {
  try {
    const { email, membership_number, remember_me } = req.body;

    // Validate input
    if (!email || !membership_number) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and membership number'
      });
    }

    // Find member by email and membership number
    const member = await Member.findOne({
      email: email.toLowerCase(),
      membership_number: membership_number
    });

    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or membership number'
      });
    }

    // Check if member is active or pending
    if (member.status === 'inactive' || member.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact support.'
      });
    }

    // Create user data for response
    const userData = {
      id: member.id,
      membershipNumber: member.membership_number,
      name: `${member.first_name} ${member.last_name}`.trim(),
      email: member.email,
      phone: member.cell_phone,
      status: member.status
    };

    // Store in session if available
    if (req.session) {
      req.session.user = userData;
      req.session.isAuthenticated = true; // ← CRITICAL: This was missing!
      
      if (remember_me) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }

      // ← ADDED: Save session explicitly before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({
            success: false,
            message: 'Error creating session. Please try again.'
          });
        }

        // Send response only after session is confirmed saved
        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            user: userData
          }
        });
      });
    } else {
      // If no session (shouldn't happen), return error
      res.status(500).json({
        success: false,
        message: 'Session not initialized'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current authenticated user
export const getCurrentUser = async (req, res) => {
  try {
    // ← UPDATED: Check both user AND isAuthenticated flag
    if (!req.session || !req.session.user || !req.session.isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const member = await Member.findById(req.session.user.id);

    if (!member) {
      // ← ADDED: Clear invalid session
      req.session.destroy();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ← ADDED: Update session with latest data (optional but good practice)
    req.session.user = {
      id: member.id,
      membershipNumber: member.membership_number,
      name: `${member.first_name} ${member.last_name}`.trim(),
      email: member.email,
      phone: member.cell_phone,
      status: member.status
    };

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: member.id,
          membershipNumber: member.membership_number,
          name: `${member.first_name} ${member.last_name}`.trim(),
          email: member.email,
          phone: member.cell_phone,
          status: member.status,
          createdAt: member.created_at,
          
          // ✅ EMERGENCY CONTACT FIELDS
          emergencyContact: {
            name: member.emergency_contact_name || '',
            phone: member.emergency_contact_phone || '',
            email: member.emergency_contact_email || '',
            relationship: member.emergency_contact_relationship || ''
          },
          
          // // ✅ ADDRESS FIELDS
          // address: member.address || '',
          // city: member.city || '',
          // state: member.state || '',
          // zipCode: member.zip_code || '',
          // country: member.country || '',
          
          // // ✅ PERSONAL DETAILS
          // gender: member.gender || '',
          // dateOfBirth: member.date_of_birth || '',
          // inquiry: member.inquiry || '',
          // hearAboutUs: member.hear_about_us || '',
          // membershipType: member.membership_type || 'standard'
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout current user
export const logout = async (req, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Could not log out. Please try again.'
          });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({
          success: true,
          message: 'Logged out successfully'
        });
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

