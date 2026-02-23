// src/services/rasaService.js
import axios from 'axios';
import redisClient from '../config/redis.js';

class RasaService {
  constructor() {
    this.rasaUrl = process.env.RASA_URL || 'http://localhost:5005';
  }

  async sendMessage(sessionId, message, senderName = 'Guest') {
    try {
      const redis = redisClient.getClient();
      
      // Check if this is an authenticated user (looking for (Member) suffix)
      const isMember = senderName.includes('(Member)');
      const cleanName = senderName.replace(' (Member)', '');
      
      console.log(`📤 Sending to Rasa: ${message} from ${cleanName} (${isMember ? 'Member' : 'Guest'})`);

      // Store user message in Redis with enhanced metadata
      await redis.rpush(`chat:${sessionId}`, JSON.stringify({
        type: 'user',
        message,
        timestamp: new Date().toISOString(),
        metadata: {
          isMember,
          userName: cleanName,
          sessionId
        }
      }));

      // Send to Rasa with metadata
      const response = await axios.post(`${this.rasaUrl}/webhooks/rest/webhook`, {
        sender: sessionId,
        message: message,
        metadata: {
          isMember,
          userName: cleanName,
          sessionId
        }
      });

      console.log(`📥 Rasa response:`, JSON.stringify(response.data, null, 2));

      // Store bot responses
      const botResponses = [];
      if (response.data && response.data.length > 0) {
        for (const botMsg of response.data) {
          if (botMsg.text) {
            await redis.rpush(`chat:${sessionId}`, JSON.stringify({
              type: 'bot',
              message: botMsg.text,
              timestamp: new Date().toISOString(),
              metadata: {
                intent: botMsg.intent,
                confidence: botMsg.confidence
              }
            }));
            botResponses.push(botMsg.text);
          }
        }
      }

      // Set expiry (24 hours)
      await redis.expire(`chat:${sessionId}`, 86400);

      console.log(`📤 Returning ${botResponses.length} response(s) to ${cleanName}:`, botResponses);

      return botResponses;
    } catch (error) {
      console.error('❌ Rasa error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getHistory(sessionId) {
    try {
      const redis = redisClient.getClient();
      const history = await redis.lrange(`chat:${sessionId}`, 0, -1);
      return history.map(item => JSON.parse(item));
    } catch (error) {
      console.error('❌ Get history error:', error);
      return [];
    }
  }

  async clearSession(sessionId) {
    try {
      const redis = redisClient.getClient();
      await redis.del(`chat:${sessionId}`);
      console.log(`🧹 Cleared session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Clear session error:', error);
    }
  }

  // New method: Get user's conversation history across sessions (for authenticated users)
  async getUserHistory(userId) {
    try {
      const redis = redisClient.getClient();
      const pattern = `chat:user_${userId}_*`;
      const keys = await redis.keys(pattern);
      
      let allMessages = [];
      for (const key of keys) {
        const history = await redis.lrange(key, 0, -1);
        allMessages = [...allMessages, ...history.map(item => JSON.parse(item))];
      }
      
      // Sort by timestamp
      return allMessages.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
    } catch (error) {
      console.error('❌ Get user history error:', error);
      return [];
    }
  }

  // New method: Track active session with user data
  async trackSession(sessionId, userData) {
    try {
      const redis = redisClient.getClient();
      await redis.setex(`active:${sessionId}`, 3600, JSON.stringify({
        ...userData,
        lastActive: new Date().toISOString()
      }));
      console.log(`👤 Tracked session ${sessionId} for user ${userData.name}`);
    } catch (error) {
      console.error('❌ Track session error:', error);
    }
  }

  // New method: Get active session data
  async getActiveSession(sessionId) {
    try {
      const redis = redisClient.getClient();
      const data = await redis.get(`active:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Get active session error:', error);
      return null;
    }
  }


  // Add to rasaService.js - Simple notification without tickets
async notifyAdmin(sessionId, issue, userData) {
  try {
    console.log('\n' + '='.repeat(50));
    console.log('🚨 ADMIN NOTIFICATION NEEDED');
    console.log('='.repeat(50));
    console.log(`Session ID: ${sessionId}`);
    console.log(`User: ${userData?.name || 'Guest'}`);
    console.log(`Email: ${userData?.email || 'Not provided'}`);
    console.log(`Issue: ${issue}`);
    console.log('='.repeat(50));
    console.log('Action required: Support team should contact user within 30 minutes\n');
    
    // In production, you could:
    // 1. Send email to support@powergym.com
    // 2. Send SMS to manager
    // 3. Post to Slack channel
    // 4. Create entry in database
    
    return true;
  } catch (error) {
    console.error('❌ Notification error:', error);
    return false;
  }
}

  // New method: Get conversation statistics
  async getConversationStats(sessionId) {
    try {
      const redis = redisClient.getClient();
      const history = await this.getHistory(sessionId);
      
      const userMessages = history.filter(msg => msg.type === 'user').length;
      const botMessages = history.filter(msg => msg.type === 'bot').length;
      
      return {
        sessionId,
        totalMessages: history.length,
        userMessages,
        botMessages,
        startTime: history[0]?.timestamp,
        endTime: history[history.length - 1]?.timestamp
      };
    } catch (error) {
      console.error('❌ Get conversation stats error:', error);
      return null;
    }
  }
}

export default new RasaService();