// controllers/authController.js
import Member from '../models/Members.js';
import MembershipPlan from '../models/MembershipPlan.js'; // ✅ ADD THIS
import MemberMembership from '../models/MemberMembership.js'; // ✅ ADD THIS
import { memberSchemas } from '../utils/validation.js';
import brevoService from '../config/brevo.js';
import { emailTemplates } from '../utils/emailTemplates.js';

// Register new member (public route)
export const registerMember = async (req, res) => {
  try {
    // Check if trial was selected (from query param or body)
    const isTrial = req.query.plan === 'trial' || req.body.plan_type === 'trial';
    
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
    
    // ===== HANDLE TRIAL SIGNUP =====
    let trialInfo = null;
    
    if (isTrial) {
      // Get the trial plan from database
      const trialPlan = await MembershipPlan.findByName('7-Day Free Trial');
      
      if (trialPlan) {
        // Calculate trial dates
        const trialStart = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7); // Add 7 days
        
        // Create trial membership
        const trialMembership = await MemberMembership.createTrial({
          member_id: member.id,
          plan_id: trialPlan.id,
          start_date: trialStart,
          end_date: trialEnd,
          status: 'active'
        });
        
        trialInfo = {
          isTrial: true,
          trialEnds: trialEnd,
          daysRemaining: 7,
          membershipNumber: trialMembership.membership_number
        };
        
        console.log(`🎉 Trial started for ${member.email}, ends on ${trialEnd.toDateString()}`);
      }
    }
    
    // ===== SEND EMAILS IN BACKGROUND (don't await) =====
    
    // 1. Send welcome email to new member (with trial info if applicable)
    const welcomeTemplate = isTrial ? emailTemplates.trialWelcome : emailTemplates.welcome;
    
    brevoService.sendEmail({
      to: member.email,
      subject: welcomeTemplate(member, trialInfo).subject,
      htmlContent: welcomeTemplate(member, trialInfo).htmlContent,
      textContent: welcomeTemplate(member, trialInfo).textContent
    }).catch(err => {
      console.error('❌ Welcome email failed for:', member.email, err.message);
    });

    // 2. Send notification to admin
    brevoService.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: emailTemplates.adminNotification(member, { isTrial }).subject,
      htmlContent: emailTemplates.adminNotification(member, { isTrial }).htmlContent
    }).catch(err => {
      console.error('❌ Admin notification failed:', err.message);
    });
    
    // Format response data
    const responseData = {
      id: member.id,
      membershipNumber: member.membership_number,
      name: `${member.first_name} ${member.last_name}`.trim(),
      email: member.email,
      phone: member.cell_phone,
      status: member.status,
      createdAt: member.created_at,
      ...(trialInfo && { trial: trialInfo }) // Add trial info if applicable
    };
    
    // Customize next steps for trial users
    const nextSteps = isTrial ? [
      'Your 7-day free trial has started!',
      'Explore all gym features and classes',
      'Your trial ends in 7 days',
      'Upgrade anytime to continue after trial'
    ] : [
      'We will review your application within 24 hours',
      'Our team will contact you to schedule an orientation',
      'Complete payment to activate your membership'
    ];
    
    res.status(201).json({
      success: true,
      message: isTrial ? 'Trial started successfully!' : 'Member registered successfully',
      data: {
        member: responseData,
        nextSteps,
        ...(trialInfo && { trial: trialInfo })
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
      req.session.isAuthenticated = true;
      
      if (remember_me) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }

      // Save session explicitly before responding
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
    // Check both user AND isAuthenticated flag
    if (!req.session || !req.session.user || !req.session.isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const member = await Member.findById(req.session.user.id);

    if (!member) {
      // Clear invalid session
      req.session.destroy();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update session with latest data
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
          
          // EMERGENCY CONTACT FIELDS
          emergencyContact: {
            name: member.emergency_contact_name || '',
            phone: member.emergency_contact_phone || '',
            email: member.emergency_contact_email || '',
            relationship: member.emergency_contact_relationship || ''
          }
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

// Forgot membership number - send membership number to user's email
export const forgotMembershipNumber = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    // Find member by email
    const member = await Member.findByEmail(email.toLowerCase());

    if (!member) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, your membership number has been sent.'
      });
    }

    // Send email with membership number using template
    await brevoService.sendEmail({
      to: member.email,
      subject: emailTemplates.forgotMembership(member).subject,
      htmlContent: emailTemplates.forgotMembership(member).htmlContent,
      textContent: emailTemplates.forgotMembership(member).textContent
    });

    console.log('✅ Membership number email sent to:', member.email);

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, your membership number has been sent.'
    });

  } catch (error) {
    console.error('Forgot membership number error:', error);
    
    // Always return same message for security
    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, your membership number has been sent.'
    });
  }
};