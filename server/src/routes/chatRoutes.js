// src/routes/chatRoutes.js
import express from 'express';
import {
  sendMessage,
  getHistory,
  clearSession,
  escalateToAdmin
} from '../controllers/chatController.js';

const router = express.Router();

/**
 * @route   POST /api/chat/message
 * @desc    Send a message to the chatbot
 * @access  Public
 */
router.post('/message', sendMessage);

/**
 * @route   GET /api/chat/history/:sessionId
 * @desc    Get conversation history for a session
 * @access  Public
 */
router.get('/history/:sessionId', getHistory);

/**
 * @route   DELETE /api/chat/session/:sessionId
 * @desc    Clear a chat session
 * @access  Public
 */
router.delete('/session/:sessionId', clearSession);


// In chatRoutes.js
router.post('/escalate', escalateToAdmin);

export default router;