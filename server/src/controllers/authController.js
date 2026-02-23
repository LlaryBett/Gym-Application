// controllers/authController.js
import Member from '../models/Members.js';
import MembershipPlan from '../models/MembershipPlan.js';
import MemberMembership from '../models/MemberMembership.js';
import { memberSchemas } from '../utils/validation.js';
import brevoService from '../config/brevo.js';
import { emailTemplates } from '../utils/emailTemplates.js';
import jwt from 'jsonwebtoken'; // ✅ ADD THIS

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
    
    // ===== SEND EMAILS IN BACKGROUND =====
    
    // 1. Send welcome email to new member
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
      ...(trialInfo && { trial: trialInfo })
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

// ✅ UPDATED: Login with JWT token
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
      status: member.status,
      role: member.role || 'member' // Add role if you have it
    };

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: member.id,
        email: member.email,
        name: userData.name,
        role: userData.role
      },
      process.env.JWT_SECRET,
      { expiresIn: remember_me ? '30d' : '7d' }
    );

    // Return token instead of session
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token: token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ UPDATED: Get current user from token
export const getCurrentUser = async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const member = await Member.findById(decoded.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user data
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
          role: member.role || 'member',
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
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ✅ UPDATED: Logout (client just removes token)
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
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