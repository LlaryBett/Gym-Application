import Trainer from '../models/Trainers.js';
import { trainerSchemas } from '../utils/validation.js';
import pool from '../database/db.js';

// ==================== ADMIN ROUTES ====================

// Get all trainers with full filters for admin
export const getAllTrainers = async (req, res) => {
  try {
    console.log('========== GET ALL TRAINERS ==========');
    console.log('User role:', req.user?.role);
    console.log('Query params:', req.query);
    
    const { 
      page = 1, 
      limit = 10, 
      search,
      status,
      specialty,
      featured,
      rating  // This is being extracted but not used!
    } = req.query;

    const filters = {};
    if (specialty) filters.specialty = specialty;
    if (status) filters.status = status;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (search) filters.search = search;
    // Rating filter is MISSING here!

    const result = await Trainer.findAll(page, limit, filters);
    
    // Get real session counts and ratings for each trainer
    const trainerIds = result.trainers.map(t => t.id);
    let sessionCounts = {};
    let averageRatings = {};
    
    if (trainerIds.length > 0) {
      const sessionQuery = `
        SELECT 
          b.trainer_id, 
          COUNT(*) as session_count,
          AVG(CASE WHEN feedback.rating IS NOT NULL THEN feedback.rating ELSE 0 END) as avg_rating
        FROM public.bookings b
        LEFT JOIN public.booking_feedback feedback ON b.id = feedback.booking_id
        WHERE b.trainer_id = ANY($1::int[]) AND b.status = 'completed'
        GROUP BY b.trainer_id
      `;
      
      const sessionResult = await pool.query(sessionQuery, [trainerIds]);
      
      sessionResult.rows.forEach(row => {
        sessionCounts[row.trainer_id] = parseInt(row.session_count);
        averageRatings[row.trainer_id] = parseFloat(row.avg_rating) || 0;
      });
    }
    
    // Format trainers for response with REAL data
    let formattedTrainers = result.trainers.map(trainer => {
      const nameParts = trainer.name?.split(' ') || ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const totalSessions = sessionCounts[trainer.id] || 0;
      const rating = averageRatings[trainer.id] || 0;
      
      return {
        id: trainer.id,
        first_name: firstName,
        last_name: lastName,
        name: trainer.name,
        specialty: trainer.specialty,
        image: trainer.image,
        bio: trainer.bio,
        certifications: trainer.certifications || [],
        email: trainer.email,
        phone: trainer.phone,
        socials: trainer.socials || {},
        featured: trainer.featured || false,
        size: trainer.size || 'regular',
        status: trainer.status,
        experience_years: trainer.experience_years || 0,
        hourly_rate: parseFloat(trainer.hourly_rate) || 0,
        rating: rating.toFixed(1),
        total_sessions: totalSessions,
        availability: trainer.availability || [],
        created_at: trainer.created_at,
        updated_at: trainer.updated_at
      };
    });
    
    // ===== APPLY RATING FILTER AFTER CALCULATING RATINGS =====
    if (rating) {
      const minRating = parseFloat(rating);
      console.log(`Filtering trainers with rating >= ${minRating}`);
      
      formattedTrainers = formattedTrainers.filter(trainer => {
        const trainerRating = parseFloat(trainer.rating) || 0;
        return trainerRating >= minRating;
      });
      
      console.log(`After rating filter: ${formattedTrainers.length} trainers`);
    }
    
    // Apply pagination AFTER filtering
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTrainers = formattedTrainers.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        trainers: paginatedTrainers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: formattedTrainers.length,
          totalPages: Math.ceil(formattedTrainers.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Get trainers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get trainer by ID with full details
export const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }
    
    // Get real session count and rating from bookings
    const sessionResult = await pool.query(
      `SELECT 
        COUNT(*) as session_count,
        AVG(feedback.rating) as avg_rating
      FROM public.bookings b
      LEFT JOIN public.booking_feedback feedback ON b.id = feedback.booking_id
      WHERE b.trainer_id = $1 AND b.status = 'completed'`,
      [trainer.id]
    );
    
    const totalSessions = parseInt(sessionResult.rows[0]?.session_count) || 0;
    const rating = parseFloat(sessionResult.rows[0]?.avg_rating) || 0;
    
    const nameParts = trainer.name?.split(' ') || ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const formattedTrainer = {
      id: trainer.id,
      first_name: firstName,
      last_name: lastName,
      name: trainer.name,
      specialty: trainer.specialty,
      image: trainer.image,
      bio: trainer.bio,
      certifications: trainer.certifications || [],
      email: trainer.email,
      phone: trainer.phone,
      socials: trainer.socials || {},
      featured: trainer.featured || false,
      size: trainer.size || 'regular',
      status: trainer.status,
      experience_years: trainer.experience_years || 0,
      hourly_rate: parseFloat(trainer.hourly_rate) || 0,
      rating: rating.toFixed(1),
      total_sessions: totalSessions,
      availability: trainer.availability || [],
      created_at: trainer.created_at,
      updated_at: trainer.updated_at
    };
    
    res.json({
      success: true,
      data: formattedTrainer
    });
  } catch (error) {
    console.error('❌ Get trainer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new trainer (admin)
export const createTrainer = async (req, res) => {
  try {
    console.log('========== CREATE TRAINER ==========');
    console.log('Request body:', req.body);
    
    const trainerData = {
      ...req.body,
      name: `${req.body.first_name || ''} ${req.body.last_name || ''}`.trim()
    };
    
    const { error, value } = trainerSchemas.create.validate(trainerData, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      console.log('Validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    const existingTrainer = await Trainer.findByEmail(value.email);
    if (existingTrainer) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const trainer = await Trainer.create(value);
    
    const nameParts = trainer.name?.split(' ') || ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const responseData = {
      id: trainer.id,
      first_name: firstName,
      last_name: lastName,
      name: trainer.name,
      specialty: trainer.specialty,
      image: trainer.image,
      bio: trainer.bio,
      certifications: trainer.certifications || [],
      email: trainer.email,
      phone: trainer.phone,
      socials: trainer.socials || {},
      featured: trainer.featured || false,
      size: trainer.size || 'regular',
      status: trainer.status,
      experience_years: trainer.experience_years || 0,
      hourly_rate: parseFloat(trainer.hourly_rate) || 0,
      rating: "0.0",
      total_sessions: 0,
      availability: trainer.availability || [],
      created_at: trainer.created_at,
      updated_at: trainer.updated_at
    };
    
    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      data: responseData
    });
  } catch (error) {
    console.error('❌ Create trainer error:', error);
    
    if (error.code === '23505' && error.constraint === 'trainers_email_key') {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create trainer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update trainer (admin) - FIXED VERSION
export const updateTrainer = async (req, res) => {
  try {
    console.log('========== UPDATE TRAINER ==========');
    console.log('ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Hourly rate received:', req.body.hourly_rate);
    
    // Combine first_name and last_name if provided
    const trainerData = { ...req.body };
    
    // Create full name from first and last name
    if (req.body.first_name || req.body.last_name) {
      trainerData.name = `${req.body.first_name || ''} ${req.body.last_name || ''}`.trim();
    }
    
    // IMPORTANT: Ensure numeric fields are properly parsed
    if (req.body.hourly_rate !== undefined) {
      trainerData.hourly_rate = parseFloat(req.body.hourly_rate);
      console.log('Parsed hourly_rate:', trainerData.hourly_rate);
    }
    
    if (req.body.experience_years !== undefined) {
      trainerData.experience_years = parseInt(req.body.experience_years);
    }
    
    // Validate update data
    const { error, value } = trainerSchemas.update.validate(trainerData, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      console.log('Validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    console.log('Validated data being sent to model:', value);
    console.log('Hourly rate in validated data:', value.hourly_rate);

    // Update trainer in database
    const trainer = await Trainer.update(req.params.id, value);
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    console.log('Updated trainer from DB:', trainer);
    console.log('Hourly rate from DB after update:', trainer.hourly_rate);
    
    // Get real session count and rating from bookings
    const sessionResult = await pool.query(
      `SELECT 
        COUNT(*) as session_count,
        AVG(feedback.rating) as avg_rating
      FROM public.bookings b
      LEFT JOIN public.booking_feedback feedback ON b.id = feedback.booking_id
      WHERE b.trainer_id = $1 AND b.status = 'completed'`,
      [trainer.id]
    );
    
    const totalSessions = parseInt(sessionResult.rows[0]?.session_count) || 0;
    const rating = parseFloat(sessionResult.rows[0]?.avg_rating) || 0;
    
    // Split name for response
    const nameParts = trainer.name?.split(' ') || ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Format response with ALL fields
    const formattedTrainer = {
      id: trainer.id,
      first_name: firstName,
      last_name: lastName,
      name: trainer.name,
      specialty: trainer.specialty,
      image: trainer.image,
      bio: trainer.bio,
      certifications: trainer.certifications || [],
      email: trainer.email,
      phone: trainer.phone,
      socials: trainer.socials || {},
      featured: trainer.featured || false,
      size: trainer.size || 'regular',
      status: trainer.status,
      experience_years: parseInt(trainer.experience_years) || 0,
      hourly_rate: parseFloat(trainer.hourly_rate) || 0,
      rating: rating.toFixed(1),
      total_sessions: totalSessions,
      availability: trainer.availability || [],
      created_at: trainer.created_at,
      updated_at: trainer.updated_at
    };
    
    console.log('Final response hourly_rate:', formattedTrainer.hourly_rate);
    
    res.json({
      success: true,
      message: 'Trainer updated successfully',
      data: formattedTrainer
    });
  } catch (error) {
    console.error('❌ Update trainer error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update trainer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete trainer (admin)
export const deleteTrainer = async (req, res) => {
  try {
    console.log('========== DELETE TRAINER ==========');
    console.log('ID:', req.params.id);
    
    const trainer = await Trainer.delete(req.params.id);
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Trainer deleted successfully',
      data: {
        id: trainer.id,
        name: trainer.name,
        email: trainer.email
      }
    });
  } catch (error) {
    console.error('❌ Delete trainer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete trainer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================== PUBLIC ROUTES ====================

// Get featured trainers (public)
export const getFeaturedTrainers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const trainers = await Trainer.getFeatured(limit);
    
    const trainerIds = trainers.map(t => t.id);
    let averageRatings = {};
    
    if (trainerIds.length > 0) {
      const ratingQuery = `
        SELECT 
          b.trainer_id,
          AVG(feedback.rating) as avg_rating
        FROM public.bookings b
        LEFT JOIN public.booking_feedback feedback ON b.id = feedback.booking_id
        WHERE b.trainer_id = ANY($1::int[]) AND b.status = 'completed'
        GROUP BY b.trainer_id
      `;
      
      const ratingResult = await pool.query(ratingQuery, [trainerIds]);
      
      ratingResult.rows.forEach(row => {
        averageRatings[row.trainer_id] = parseFloat(row.avg_rating) || 0;
      });
    }
    
    const formattedTrainers = trainers.map(trainer => ({
      id: trainer.id,
      name: trainer.name,
      specialty: trainer.specialty,
      image: trainer.image,
      bio: trainer.bio,
      certifications: trainer.certifications || [],
      size: trainer.size || 'regular',
      rating: (averageRatings[trainer.id] || 0).toFixed(1)
    }));
    
    res.json({
      success: true,
      data: formattedTrainers
    });
  } catch (error) {
    console.error('❌ Get featured trainers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured trainers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get trainers by specialty (public)
export const getTrainersBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    const trainers = await Trainer.findBySpecialty(specialty);
    
    const trainerIds = trainers.map(t => t.id);
    let averageRatings = {};
    
    if (trainerIds.length > 0) {
      const ratingQuery = `
        SELECT 
          b.trainer_id,
          AVG(feedback.rating) as avg_rating
        FROM public.bookings b
        LEFT JOIN public.booking_feedback feedback ON b.id = feedback.booking_id
        WHERE b.trainer_id = ANY($1::int[]) AND b.status = 'completed'
        GROUP BY b.trainer_id
      `;
      
      const ratingResult = await pool.query(ratingQuery, [trainerIds]);
      
      ratingResult.rows.forEach(row => {
        averageRatings[row.trainer_id] = parseFloat(row.avg_rating) || 0;
      });
    }
    
    const formattedTrainers = trainers.map(trainer => ({
      id: trainer.id,
      name: trainer.name,
      specialty: trainer.specialty,
      image: trainer.image,
      bio: trainer.bio,
      certifications: trainer.certifications || [],
      email: trainer.email,
      phone: trainer.phone,
      rating: (averageRatings[trainer.id] || 0).toFixed(1)
    }));
    
    res.json({
      success: true,
      data: formattedTrainers
    });
  } catch (error) {
    console.error('❌ Get trainers by specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainers by specialty',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get available specialties (public)
export const getSpecialties = async (req, res) => {
  try {
    const specialties = await Trainer.getSpecialties();
    
    res.json({
      success: true,
      data: specialties
    });
  } catch (error) {
    console.error('❌ Get specialties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specialties',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get trainer statistics (public)
export const getTrainerStats = async (req, res) => {
  try {
    const stats = await Trainer.getStats();
    
    const sessionStats = await pool.query(
      `SELECT 
        COUNT(DISTINCT b.trainer_id) as active_trainers,
        COUNT(*) as total_sessions
      FROM public.bookings b
      WHERE b.status = 'completed'`
    );
    
    res.json({
      success: true,
      data: {
        ...stats,
        active_trainers: parseInt(sessionStats.rows[0]?.active_trainers) || 0,
        total_sessions: parseInt(sessionStats.rows[0]?.total_sessions) || 0
      }
    });
  } catch (error) {
    console.error('❌ Get trainer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainer statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};