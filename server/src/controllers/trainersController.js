import Trainer from '../models/Trainers.js';
import { trainerSchemas } from '../utils/validation.js';

// Get all trainers
export const getAllTrainers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      specialty, 
      featured,
      search 
    } = req.query;

    const filters = {};
    if (specialty) filters.specialty = specialty;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (search) filters.search = search;

    const result = await Trainer.findAll(page, limit, filters);
    
    // Format trainers for response
    const formattedTrainers = result.trainers.map(trainer => ({
      id: trainer.id,
      name: trainer.name,
      specialty: trainer.specialty,
      image: trainer.image,
      bio: trainer.bio,
      certifications: trainer.certifications || [],
      email: trainer.email,
      phone: trainer.phone,
      socials: trainer.socials || {},
      featured: trainer.featured,
      size: trainer.size,
      status: trainer.status,
      createdAt: trainer.created_at,
      updatedAt: trainer.updated_at
    }));
    
    res.json({
      success: true,
      data: {
        trainers: formattedTrainers,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get trainers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainers'
    });
  }
};

// Get trainer by ID
export const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }
    
    // Format trainer data for response
    const formattedTrainer = {
      id: trainer.id,
      name: trainer.name,
      specialty: trainer.specialty,
      image: trainer.image,
      bio: trainer.bio,
      certifications: trainer.certifications || [],
      email: trainer.email,
      phone: trainer.phone,
      socials: trainer.socials || {},
      featured: trainer.featured,
      size: trainer.size,
      status: trainer.status,
      createdAt: trainer.created_at,
      updatedAt: trainer.updated_at
    };
    
    res.json({
      success: true,
      data: formattedTrainer
    });
  } catch (error) {
    console.error('Get trainer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainer'
    });
  }
};

// Create new trainer
export const createTrainer = async (req, res) => {
  try {
    // Validate request data
    const { error, value } = trainerSchemas.create.validate(req.body, { 
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

    // Check if email already exists
    const existingTrainer = await Trainer.findByEmail(value.email);
    if (existingTrainer) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new trainer
    const trainer = await Trainer.create(value);
    
    // Format response data
    const responseData = {
      id: trainer.id,
      name: trainer.name,
      specialty: trainer.specialty,
      image: trainer.image,
      email: trainer.email,
      phone: trainer.phone,
      featured: trainer.featured,
      status: trainer.status,
      createdAt: trainer.created_at
    };
    
    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Create trainer error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint === 'trainers_email_key') {
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

// Update trainer
export const updateTrainer = async (req, res) => {
  try {
    // Validate update data
    const { error, value } = trainerSchemas.update.validate(req.body, { 
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

    const trainer = await Trainer.update(req.params.id, value);
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }
    
    // Format response
    const formattedTrainer = {
      id: trainer.id,
      name: trainer.name,
      specialty: trainer.specialty,
      email: trainer.email,
      phone: trainer.phone,
      featured: trainer.featured,
      status: trainer.status,
      updatedAt: trainer.updated_at
    };
    
    res.json({
      success: true,
      message: 'Trainer updated successfully',
      data: formattedTrainer
    });
  } catch (error) {
    console.error('Update trainer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trainer'
    });
  }
};

// Delete trainer
export const deleteTrainer = async (req, res) => {
  try {
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
    console.error('Delete trainer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete trainer'
    });
  }
};

// Get featured trainers
export const getFeaturedTrainers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const trainers = await Trainer.getFeatured(limit);
    
    const formattedTrainers = trainers.map(trainer => ({
      id: trainer.id,
      name: trainer.name,
      specialty: trainer.specialty,
      image: trainer.image,
      bio: trainer.bio,
      certifications: trainer.certifications || [],
      size: trainer.size
    }));
    
    res.json({
      success: true,
      data: formattedTrainers
    });
  } catch (error) {
    console.error('Get featured trainers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured trainers'
    });
  }
};

// Get trainers by specialty
export const getTrainersBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    const trainers = await Trainer.findBySpecialty(specialty);
    
    const formattedTrainers = trainers.map(trainer => ({
      id: trainer.id,
      name: trainer.name,
      specialty: trainer.specialty,
      image: trainer.image,
      bio: trainer.bio,
      certifications: trainer.certifications || [],
      email: trainer.email,
      phone: trainer.phone
    }));
    
    res.json({
      success: true,
      data: formattedTrainers
    });
  } catch (error) {
    console.error('Get trainers by specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainers by specialty'
    });
  }
};

// Get available specialties
export const getSpecialties = async (req, res) => {
  try {
    const specialties = await Trainer.getSpecialties();
    
    res.json({
      success: true,
      data: specialties
    });
  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specialties'
    });
  }
};

// Get trainer statistics
export const getTrainerStats = async (req, res) => {
  try {
    const stats = await Trainer.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get trainer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainer statistics'
    });
  }
};