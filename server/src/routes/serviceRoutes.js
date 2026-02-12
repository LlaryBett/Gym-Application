import express from 'express';
import {
  // Services
  getAllServices,
  getServiceById,
  getFeaturedServices,
  getServicesByCategory,
  getServiceCategories,
  createService,
  updateService,
  deleteService,
  
  // Service Categories (for categories section)
  getAllServiceCategories,
  getServiceCategoryById,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  
  // Service Category Items
  addServiceToCategory,
  removeServiceFromCategory,
  updateServiceCategoryItem,
  
  // Statistics
  getServiceStats
} from '../controllers/servicesController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Services
router.get('/', getAllServices);
router.get('/featured', getFeaturedServices);
router.get('/categories/list', getServiceCategories);
router.get('/category/:category', getServicesByCategory);
router.get('/stats', getServiceStats);
router.get('/:id', getServiceById);

// Service Categories (for the categories section in Services page)
router.get('/categories/all', getAllServiceCategories);
router.get('/categories/:id', getServiceCategoryById);

// ==================== ADMIN ONLY ROUTES ====================

// Services CRUD
router.post('/', authMiddleware, adminMiddleware, createService);
router.put('/:id', authMiddleware, adminMiddleware, updateService);
router.delete('/:id', authMiddleware, adminMiddleware, deleteService);

// Service Categories CRUD
router.post('/categories', authMiddleware, adminMiddleware, createServiceCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, updateServiceCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, deleteServiceCategory);

// Service Category Items
router.post('/categories/items', authMiddleware, adminMiddleware, addServiceToCategory);
router.put('/categories/items/:id', authMiddleware, adminMiddleware, updateServiceCategoryItem);
router.delete('/categories/items/:id', authMiddleware, adminMiddleware, removeServiceFromCategory);

export default router;