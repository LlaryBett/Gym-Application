// client/src/services/chatService.js
import { chatAPI } from './api';

class ChatService {
  constructor() {
    this.sessionId = localStorage.getItem('chatSessionId') || null;
    this.userId = null;
  }

  /**
   * Initialize with authenticated user
   * @param {Object} user - Authenticated user object
   */
  initUser(user) {
    this.userId = user?.id || null;
    
    // For authenticated users, use their ID as part of session
    if (this.userId) {
      const userSessionId = `user_${this.userId}_${Date.now()}`;
      this.setSessionId(userSessionId);
    }
  }

  /**
   * Get or create session ID
   * @returns {string} - Current session ID
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * Set session ID and store in localStorage
   * @param {string} sessionId - New session ID
   */
  setSessionId(sessionId) {
    this.sessionId = sessionId;
    if (sessionId) {
      localStorage.setItem('chatSessionId', sessionId);
    } else {
      localStorage.removeItem('chatSessionId');
    }
  }

  /**
   * Send a message to the chatbot
   * @param {string} message - User's message
   * @param {string} userName - User's name (optional)
   * @returns {Promise} - Bot responses
   */
  async sendMessage(message, userName = 'Guest') {
    try {
      // Use authenticated user's name if available
      const displayName = this.userId ? `${userName} (Member)` : userName;
      
      const response = await chatAPI.sendMessage(message, this.sessionId, displayName);
      
      if (response.success && response.sessionId) {
        this.setSessionId(response.sessionId);
      }
      
      return {
        success: response.success,
        sessionId: response.sessionId,
        responses: response.responses || []
      };
    } catch (error) {
      console.error('Chat service error:', error);
      return {
        success: false,
        responses: ['Sorry, I\'m having trouble connecting. Please try again.']
      };
    }
  }

  /**
   * Get conversation history
   * @returns {Promise} - Array of formatted messages
   */
  async getHistory() {
    if (!this.sessionId) {
      console.log("📭 No sessionId found");
      return [];
    }
    
    try {
      console.log("🔍 Fetching history for session:", this.sessionId);
      const response = await chatAPI.getHistory(this.sessionId);
      console.log("📥 Raw API response:", response);

      if (response.success && response.history) {
        console.log("✅ Fetched messages:", response.history);
        
        // 🔥 FIX: Format history to match component expectations
        const formattedHistory = response.history.map((msg, index) => ({
          id: `msg-${Date.now()}-${index}-${Math.random()}`,
          text: msg.message || '',  // Map 'message' to 'text'
          sender: msg.type || 'user', // Map 'type' to 'sender'
          timestamp: msg.timestamp || new Date().toISOString()
        }));
        
        console.log("📤 Formatted history:", formattedHistory);
        return formattedHistory;
      } else {
        console.log("⚠️ No history found");
        return [];
      }

    } catch (error) {
      console.error("❌ Failed to fetch history:", error);
      return [];
    }
  }

  /**
   * Clear current session
   */
  async clearSession() {
    if (!this.sessionId) return;
    
    try {
      await chatAPI.clearSession(this.sessionId);
      this.setSessionId(null);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Track user data with current session
   * @param {Object} userData - User information
   */
  async trackUser(userData) {
    if (!this.sessionId || !this.userId) return;
    
    try {
      await chatAPI.trackSession(this.sessionId, {
        userId: this.userId,
        name: userData.name,
        email: userData.email,
        membershipType: userData.membershipType,
        isMember: true
      });
    } catch (error) {
      console.error('Failed to track session:', error);
    }
  }

  /**
   * Format messages for display in chat UI
   * @param {Array} responses - Raw bot responses
   * @returns {Array} - Formatted messages
   */
  formatBotResponses(responses) {
    if (!responses || !Array.isArray(responses)) return [];
    return responses.map((text, index) => ({
      id: `bot-${Date.now()}-${index}-${Math.random()}`,
      text,
      sender: 'bot',
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Create a user message object
   * @param {string} text - Message text
   * @returns {Object} - Formatted user message
   */
  createUserMessage(text) {
    return {
      id: `user-${Date.now()}-${Math.random()}`,
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      userId: this.userId // Attach user ID if authenticated
    };
  }

  /**
   * Check if current user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.userId;
  }
}

// Create singleton instance
const chatService = new ChatService();
export default chatService;