import Joi from 'joi';
import validator from 'validator';

/**
 * Joi schemas for validation - UPDATED to EXACTLY match frontend data
 */
export const memberSchemas = {
  registration: Joi.object({
    // EXACT field names from your frontend payload
    first_name: Joi.string()  // Frontend sends 'first_name' not 'name'
      .required()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        'string.pattern.base': 'First name can only contain letters and spaces',
        'any.required': 'First name is required',
        'string.min': 'First name must be at least 2 characters',
        'string.max': 'First name cannot exceed 100 characters'
      }),
    
    last_name: Joi.string()  // Frontend sends 'last_name'
      .required()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        'string.pattern.base': 'Last name can only contain letters and spaces',
        'any.required': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters',
        'string.max': 'Last name cannot exceed 100 characters'
      }),
    
    email: Joi.string()
      .required()
      .email()
      .max(255)
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    cell_phone: Joi.string()  // UPDATED: Kenyan phone number support
      .required()
      .pattern(/^(\+254|0)[17]\d{8}$/)
      .messages({
        'string.pattern.base': 'Please provide a valid Kenyan phone number (e.g., 07161234567, 01151234567, +2547161234567)',
        'any.required': 'Phone number is required'
      }),
    
    gender: Joi.string()
      .valid('male', 'female', 'other', '')
      .allow('')
      .messages({
        'any.only': 'Gender must be male, female, other, or empty'
      }),
    
    date_of_birth: Joi.date()
      .iso()
      .max('now')
      .allow(null, '')
      .messages({
        'date.format': 'Date of birth must be in ISO format (YYYY-MM-DD)',
        'date.max': 'Date of birth cannot be in the future'
      }),
    
    inquiry: Joi.string()
      .allow('')
      .max(1000)
      .messages({
        'string.max': 'Inquiry cannot exceed 1000 characters'
      }),
    
    // Emergency contact fields - EXACT as sent
    emergency_contact_name: Joi.string()
      .allow('')
      .max(200)
      .messages({
        'string.max': 'Emergency contact name cannot exceed 200 characters'
      }),
    
    emergency_contact_phone: Joi.string()  // UPDATED: Kenyan phone number support
      .allow('')
      .pattern(/^(\+254|0)[17]\d{8}$|^$/)
      .messages({
        'string.pattern.base': 'Please provide a valid Kenyan emergency contact phone number (e.g., 07161234567) or leave empty'
      }),
    
    emergency_contact_email: Joi.string()
      .allow('')
      .email()
      .max(255)
      .messages({
        'string.email': 'Please provide a valid emergency contact email'
      }),
    
    emergency_contact_relationship: Joi.string()
      .allow('')
      .max(100)
      .messages({
        'string.max': 'Relationship cannot exceed 100 characters'
      }),
    
    hear_about_us: Joi.string()  // Frontend sends 'hear_about_us' not 'referral_source'
      .required()
      .max(100)
      .messages({
        'any.required': 'Please tell us how you heard about us',
        'string.max': 'Selection cannot exceed 100 characters'
      }),
    
    // Optional fields with defaults
    membership_type: Joi.string()
      .valid('standard', 'premium', 'student', 'family')
      .default('standard')
      .messages({
        'any.only': 'Membership type must be standard, premium, student, or family'
      }),
    
    // Optional address fields
    address: Joi.string().allow('').max(500),
    city: Joi.string().allow('').max(100),
    state: Joi.string().allow('').max(100),
    zip_code: Joi.string().allow('').max(20),
    country: Joi.string().allow('').max(100)
    
    // REMOVED: name, phone, referral_source, registration_date, status
    // These are not in your frontend payload
  }).options({ stripUnknown: true }),
  
  update: Joi.object({
    // Accept both formats for updates
    name: Joi.string().min(2).max(200),
    first_name: Joi.string().min(2).max(100),
    last_name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^(\+254|0)[17]\d{8}$/),
    cell_phone: Joi.string().pattern(/^(\+254|0)[17]\d{8}$/),
    status: Joi.string().valid('pending', 'active', 'suspended', 'cancelled'),
    membership_type: Joi.string().valid('standard', 'premium', 'student', 'family'),
    membershipType: Joi.string().valid('standard', 'premium', 'student', 'family'),
    date_of_birth: Joi.date().iso().max('now'),
    dateOfBirth: Joi.date().iso().max('now'),
    inquiry: Joi.string().max(1000),
    gender: Joi.string().valid('male', 'female', 'other', ''),
    referral_source: Joi.string().max(100),
    hear_about_us: Joi.string().max(100),
    hearAboutUs: Joi.string().max(100),
    emergency_contact_name: Joi.string().allow('').max(200),
    emergency_contact_phone: Joi.string().allow('').pattern(/^(\+254|0)[17]\d{8}$|^$/),
    emergency_contact_email: Joi.string().allow('').email(),
    emergency_contact_relationship: Joi.string().allow('').max(100),
    address: Joi.string().max(500),
    city: Joi.string().max(100),
    state: Joi.string().max(100),
    zip_code: Joi.string().max(20),
    country: Joi.string().max(100)
  }).min(1).options({ stripUnknown: true })
};

// Export the old function for backward compatibility
export const validateMemberRegistration = (data) => {
  return memberSchemas.registration.validate(data, { abortEarly: false });
};

/**
 * Validator functions
 */
export const validators = {
  /**
   * Validate email address
   */
  isEmail: (email) => {
    return validator.isEmail(email);
  },
  
  /**
   * Validate phone number - UPDATED for Kenyan numbers
   */
  isPhone: (phone) => {
    // Remove any non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Check Kenyan format: +254xxxxxxxxx or 0xxxxxxxxxx
    const kenyanRegex = /^(\+254|0)[17]\d{8}$/;
    
    if (!kenyanRegex.test(cleanPhone)) {
      return false;
    }
    
    // Also check with validator for general validity
    return validator.isMobilePhone(cleanPhone, 'any', { strictMode: false });
  },
  
  /**
   * Validate date string
   */
  isDate: (dateString) => {
    return validator.isDate(dateString, { format: 'YYYY-MM-DD', strictMode: true });
  },
  
  /**
   * Check if string contains only letters and spaces
   */
  isAlphaSpace: (str) => {
    return /^[a-zA-Z\s]+$/.test(str);
  },
  
  /**
   * Validate password strength
   */
  isStrongPassword: (password) => {
    return validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    });
  },
  
  /**
   * Sanitize input to prevent XSS
   */
  sanitize: (input) => {
    return validator.escape(validator.trim(input));
  }
};

/**
 * Validation middleware using Joi
 */
export const validateWithJoi = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Replace body with validated data
    req.body = value;
    next();
  };
};

/**
 * Validate file upload
 */
export const validateFile = (file, options = {}) => {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    maxSize = 5 * 1024 * 1024, // 5MB
    required = false
  } = options;
  
  if (required && !file) {
    return { valid: false, error: 'File is required' };
  }
  
  if (!file) {
    return { valid: true };
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB` 
    };
  }
  
  return { valid: true };
};

// trainers

// Trainer validation schemas
export const trainerSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    specialty: Joi.string().min(2).max(100).required(),
    image: Joi.string().uri().allow(''),
    bio: Joi.string().max(1000).allow(''),
    certifications: Joi.array().items(Joi.string()),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).allow(''),
    socials: Joi.object({
      instagram: Joi.string().uri().allow(''),
      facebook: Joi.string().uri().allow(''),
      linkedin: Joi.string().uri().allow(''),
      x: Joi.string().uri().allow(''),
      whatsapp: Joi.string().allow('')
    }),
    featured: Joi.boolean(),
    size: Joi.string().valid('small', 'regular', 'medium-large', 'large')
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100),
    specialty: Joi.string().min(2).max(100),
    image: Joi.string().uri().allow(''),
    bio: Joi.string().max(1000).allow(''),
    certifications: Joi.array().items(Joi.string()),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).allow(''),
    socials: Joi.object({
      instagram: Joi.string().uri().allow(''),
      facebook: Joi.string().uri().allow(''),
      linkedin: Joi.string().uri().allow(''),
      x: Joi.string().uri().allow(''),
      whatsapp: Joi.string().allow('')
    }),
    featured: Joi.boolean(),
    size: Joi.string().valid('small', 'regular', 'medium-large', 'large'),
    status: Joi.string().valid('active', 'inactive', 'deleted')
  }).min(1) // At least one field to update
};

// services 

// Service validation schemas
export const serviceSchemas = {
  create: Joi.object({
    title: Joi.string().min(2).max(100).required(),
    image: Joi.string().uri().required(),
    description: Joi.string().max(500).allow(''),
    category: Joi.string().valid('Training', 'Wellness', 'Facilities').required(),
    featured: Joi.boolean()
  }),

  update: Joi.object({
    title: Joi.string().min(2).max(100),
    image: Joi.string().uri(),
    description: Joi.string().max(500).allow(''),
    category: Joi.string().valid('Training', 'Wellness', 'Facilities'),
    featured: Joi.boolean(),
    status: Joi.string().valid('active', 'inactive', 'deleted')
  }).min(1),

  category: {
    create: Joi.object({
      name: Joi.string().min(2).max(50).required(),
      display_order: Joi.number().integer().min(0)
    }),
    update: Joi.object({
      name: Joi.string().min(2).max(50),
      display_order: Joi.number().integer().min(0),
      status: Joi.string().valid('active', 'inactive', 'deleted')
    }).min(1)
  },

  categoryItem: {
    create: Joi.object({
      category_id: Joi.number().integer().required(),
      service_name: Joi.string().min(2).max(100).required(),
      display_order: Joi.number().integer().min(0)
    }),
    update: Joi.object({
      service_name: Joi.string().min(2).max(100),
      display_order: Joi.number().integer().min(0),
      status: Joi.string().valid('active', 'inactive', 'deleted')
    }).min(1)
  }
};

// booking service 
// Booking validation schemas
export const bookingSchemas = {
    create: Joi.object({
        member_id: Joi.number().integer().required(),
        trainer_id: Joi.number().integer().required(),
        service_id: Joi.number().integer().required(),
        service_name: Joi.string().required(),
        trainer_name: Joi.string().required(),
        member_name: Joi.string().required(),
        member_email: Joi.string().email().required(),
        booking_date: Joi.date().iso().required(),
        booking_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] [AP]M$/).required(),
        session_type: Joi.string().valid('one-on-one', 'group', 'virtual').default('one-on-one'),
        duration_minutes: Joi.number().integer().min(15).max(180).default(60),
        notes: Joi.string().max(500).allow(''),
        special_requests: Joi.string().max(500).allow('')
    }),

    updateStatus: Joi.object({
        status: Joi.string().valid('confirmed', 'cancelled', 'completed', 'no-show').required(),
        reason: Joi.string().when('status', {
            is: 'cancelled',
            then: Joi.string().max(500).required(),
            otherwise: Joi.string().max(500).allow('')
        })
    }),

    reschedule: Joi.object({
        new_date: Joi.date().iso().required(),
        new_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] [AP]M$/).required()
    }),

    availability: Joi.object({
        trainer_id: Joi.number().integer().required(),
        date: Joi.date().iso().required(),
        times: Joi.array().items(
            Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] [AP]M$/)
        ).min(1).required()
    }),

    feedback: Joi.object({
        booking_id: Joi.number().integer().required(),
        member_id: Joi.number().integer().required(),
        trainer_id: Joi.number().integer().required(),
        rating: Joi.number().integer().min(1).max(5).required(),
        review: Joi.string().max(1000).allow(''),
        would_recommend: Joi.boolean()
    }),

    payment: Joi.object({
        booking_id: Joi.number().integer().required(),
        amount: Joi.number().precision(2).positive().required(),
        payment_method: Joi.string().valid(
            'credit_card', 'debit_card', 'cash', 'bank_transfer', 'mobile_money'
        ).required(),
        transaction_id: Joi.string().max(100),
        status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').default('pending')
    })
};

// Membership Plan validation schemas
// Membership Plan validation schemas
export const membershipSchemas = {
    // Purchase membership
    purchase: Joi.object({
        plan_id: Joi.number().integer().required(),
        billing_cycle: Joi.string().valid('monthly', 'yearly').required(),
        auto_renew: Joi.boolean().default(true)
    }),

    // Create/Update plan (admin)
    plan: {
        create: Joi.object({
            name: Joi.string().min(2).max(50).required(),
            description: Joi.string().max(500).allow(''),
            price_monthly: Joi.number().precision(2).positive().required(),
            price_yearly: Joi.number().precision(2).positive().required(),
            highlighted: Joi.boolean().default(false),
            features: Joi.array().items(Joi.string()).min(1).required(),
            display_order: Joi.number().integer().min(0).default(0)
        }),
        update: Joi.object({
            name: Joi.string().min(2).max(50),
            description: Joi.string().max(500).allow(''),
            price_monthly: Joi.number().precision(2).positive(),
            price_yearly: Joi.number().precision(2).positive(),
            highlighted: Joi.boolean(),
            features: Joi.array().items(Joi.string()).min(1),
            display_order: Joi.number().integer().min(0),
            status: Joi.string().valid('active', 'inactive', 'deleted')
        }).min(1)
    },

    // Change plan
    changePlan: Joi.object({
        new_plan_id: Joi.number().integer().required(),
        new_billing_cycle: Joi.string().valid('monthly', 'yearly').required()
    }),

    // Cancel membership
    cancel: Joi.object({
        reason: Joi.string().max(500).allow('')
    }),

    // Apply discount
    discount: Joi.object({
        code: Joi.string().max(50).required()
    })
};

// Programs validation schemas
// Program validation schemas
export const programSchemas = {
    // Public queries
    getAll: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(50).default(8),
        category: Joi.string(),
        featured: Joi.boolean(),
        search: Joi.string().allow('')
    }),

    // Create program (admin)
    create: Joi.object({
        title: Joi.string().min(2).max(100).required(),
        image: Joi.string().uri().required(),
        description: Joi.string().max(1000).allow(''),
        category: Joi.string().required(),
        price: Joi.string().max(50).allow(''),
        capacity: Joi.string().max(50).allow(''),
        featured: Joi.boolean().default(false),
        duration: Joi.string().max(50).allow(''),
        level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'All Levels').default('All Levels'),
        display_order: Joi.number().integer().min(0).default(0),
        // New fields
        instructor_id: Joi.number().integer().allow(null),
        instructor_name: Joi.string().max(100).allow(''),
        instructor_bio: Joi.string().max(1000).allow(''),
        instructor_image: Joi.string().uri().allow(''),
        video_url: Joi.string().uri().allow(''),
        total_spots: Joi.number().integer().min(1).max(1000).default(20),
        enrolled_count: Joi.number().integer().min(0).default(0)
    }),

    // Update program (admin)
    update: Joi.object({
        title: Joi.string().min(2).max(100),
        image: Joi.string().uri(),
        description: Joi.string().max(1000).allow(''),
        category: Joi.string(),
        price: Joi.string().max(50).allow(''),
        capacity: Joi.string().max(50).allow(''),
        featured: Joi.boolean(),
        duration: Joi.string().max(50).allow(''),
        level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'All Levels'),
        display_order: Joi.number().integer().min(0),
        status: Joi.string().valid('active', 'inactive', 'deleted'),
        // New fields
        instructor_id: Joi.number().integer().allow(null),
        instructor_name: Joi.string().max(100).allow(''),
        instructor_bio: Joi.string().max(1000).allow(''),
        instructor_image: Joi.string().uri().allow(''),
        video_url: Joi.string().uri().allow(''),
        total_spots: Joi.number().integer().min(1).max(1000),
        enrolled_count: Joi.number().integer().min(0)
    }).min(1),

    // Schedule
    schedule: {
        create: Joi.object({
            program_id: Joi.number().integer().required(),
            day_of_week: Joi.string().valid('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun').required(),
            start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
            end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
            class_name: Joi.string().min(2).max(100).required(),
            instructor: Joi.string().max(100).allow(''),
            location: Joi.string().max(100).allow(''),
            capacity: Joi.number().integer().min(1).max(100).default(20),
            enrolled: Joi.number().integer().min(0).default(0)
        }),
        update: Joi.object({
            program_id: Joi.number().integer(),
            day_of_week: Joi.string().valid('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'),
            start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            class_name: Joi.string().min(2).max(100),
            instructor: Joi.string().max(100).allow(''),
            location: Joi.string().max(100).allow(''),
            capacity: Joi.number().integer().min(1).max(100),
            enrolled: Joi.number().integer().min(0),
            status: Joi.string().valid('active', 'inactive', 'deleted')
        }).min(1)
    },

    // Enrollment
    enroll: Joi.object({
        program_id: Joi.number().integer().required()
    }),

    // ==================== NEW PROGRAM DETAIL FEATURES ====================

    // Gallery image
    gallery: {
        add: Joi.object({
            image_url: Joi.string().uri().required(),
            caption: Joi.string().max(255).allow(''),
            display_order: Joi.number().integer().min(0).default(0)
        })
    },

    // Curriculum
    curriculum: {
        add: Joi.object({
            week_number: Joi.number().integer().min(1).max(52).required(),
            week_title: Joi.string().min(2).max(100).required(),
            topics: Joi.array().items(Joi.string().min(1).max(200)).default([])
        }),
        update: Joi.object({
            week_title: Joi.string().min(2).max(100),
            topics: Joi.array().items(Joi.string().min(1).max(200)),
            display_order: Joi.number().integer().min(0)
        }).min(1)
    },

    // FAQ
    faq: {
        add: Joi.object({
            question: Joi.string().min(5).max(500).required(),
            answer: Joi.string().min(5).max(2000).required(),
            display_order: Joi.number().integer().min(0).default(0)
        }),
        update: Joi.object({
            question: Joi.string().min(5).max(500),
            answer: Joi.string().min(5).max(2000),
            display_order: Joi.number().integer().min(0)
        }).min(1)
    },

    // Start date
    startDate: {
        add: Joi.object({
            start_date: Joi.date().iso().min('now').required(),
            spots_available: Joi.number().integer().min(0).required(),
            total_spots: Joi.number().integer().min(1).required()
        }),
        update: Joi.object({
            spots_available: Joi.number().integer().min(0).required()
        })
    },

    // Related program
    related: {
        add: Joi.object({
            related_program_id: Joi.number().integer().required(),
            display_order: Joi.number().integer().min(0).default(0)
        })
    },

    // Upgrade option
    upgrade: {
        add: Joi.object({
            upgrade_program_id: Joi.number().integer().required(),
            badge_text: Joi.string().max(50).allow(''),
            display_order: Joi.number().integer().min(0).default(0)
        })
    },

    // Save/Unsave program (wishlist)
    save: Joi.object({
        program_id: Joi.number().integer().required()
    }),

    // ==================== BULK OPERATIONS ====================

    // Bulk add curriculum weeks
    bulkCurriculum: Joi.object({
        weeks: Joi.array().items(
            Joi.object({
                week_number: Joi.number().integer().min(1).required(),
                week_title: Joi.string().min(2).max(100).required(),
                topics: Joi.array().items(Joi.string()).default([])
            })
        ).min(1).required()
    }),

    // Bulk add FAQs
    bulkFaqs: Joi.object({
        faqs: Joi.array().items(
            Joi.object({
                question: Joi.string().min(5).max(500).required(),
                answer: Joi.string().min(5).max(2000).required(),
                display_order: Joi.number().integer().min(0).default(0)
            })
        ).min(1).required()
    }),

    // Bulk add start dates
    bulkStartDates: Joi.object({
        dates: Joi.array().items(
            Joi.object({
                start_date: Joi.date().iso().min('now').required(),
                spots_available: Joi.number().integer().min(0).required(),
                total_spots: Joi.number().integer().min(1).required()
            })
        ).min(1).required()
    })
};

// ==================== EXPORT ALL SCHEMAS ====================
export default {
    programSchemas
};