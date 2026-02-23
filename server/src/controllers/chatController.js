// server/src/controllers/chatController.js
import rasaService from '../services/rasaService.js';
import { v4 as uuidv4 } from 'uuid';

export const sendMessage = async (req, res) => {
  try {
    const { message, sessionId, userName } = req.body;
    
    // Generate session ID if not provided
    const chatSessionId = sessionId || uuidv4();
    
    // Send to Rasa - this returns an array of STRINGS
    const rasaResponse = await rasaService.sendMessage(chatSessionId, message, userName);
    
    console.log('Rasa response:', rasaResponse); // Debug log
    
    // ✅ FIXED: Send the strings directly, no need to map
    res.json({
      success: true,
      sessionId: chatSessionId,
      responses: rasaResponse  // This is already an array of strings
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID required'
      });
    }

    // ✅ FIXED: Method name should match your service
    const history = await rasaService.getHistory(sessionId);
    
    res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history'
    });
  }
};

export const clearSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID required'
      });
    }

    // ✅ FIXED: Method name should match your service
    await rasaService.clearSession(sessionId);
    
    res.json({
      success: true,
      message: 'Session cleared'
    });

  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear session'
    });
  }
};

// Remove trackActiveSession if not needed, or fix it too
export const trackActiveSession = async (req, res) => {
  try {
    const { sessionId, userData } = req.body;
    
    // You need to implement this in rasaService if you want it
    // await rasaService.setActiveSession(sessionId, userData);
    
    res.json({
      success: true
    });

  } catch (error) {
    console.error('Track session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track session'
    });
  }
};

// In chatController.js, add escalation handler
export const escalateToAdmin = async (req, res) => {
  try {
    const { sessionId, issue, userData } = req.body;
    
    await rasaService.notifyAdmin(sessionId, issue, userData);
    
    res.json({
      success: true,
      message: 'Support team notified'
    });
  } catch (error) {
    console.error('Escalation error:', error);
    res.status(500).json({ success: false });
  }
};