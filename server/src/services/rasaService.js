// src/services/rasaService.js
import axios from 'axios';
import redisClient from '../config/redis.js';

class RasaService {
  constructor() {
    this.rasaUrl = process.env.RASA_URL || 'http://localhost:5005';
  }

  // Map intents to friendly responses
  getResponseForIntent(intent, confidence, cleanName) {
    const responses = {
      'greet': `Hello ${cleanName}! 👋 Welcome to PowerGym. How can I help you today?`,
      'goodbye': 'Thanks for chatting! Have a great workout! 💪',
      'ask_membership_plans': 'We have 3 great membership plans:\n\n💪 **Basic** - Ksh 3,000/month\n- Full gym access\n- Locker room access\n\n🔥 **Pro** - Ksh 5,000/month\n- Everything in Basic\n- Unlimited group classes\n- 1 PT session/month\n\n👑 **Premium** - Ksh 8,000/month\n- Everything in Pro\n- 4 PT sessions/month\n- Nutrition consultation',
      'ask_classes': 'We offer a wide variety of classes! 🧘‍♂️\n\n• Yoga & Pilates\n• HIIT & Cardio Blast\n• Spin Cycling\n• Strength Training\n• Zumba & Dance\n\nClasses run daily from 6am to 8pm.',
      'ask_trainers': 'Our certified trainers are ready to help you! 💪\n\n• **John** - Strength & Conditioning\n• **Sarah** - Yoga & Pilates\n• **Mike** - HIIT & Boxing\n• **Emma** - Nutrition & Weight Loss',
      'ask_price': '💰 **Membership Prices:**\n\nBasic: Ksh 3,000/month\nPro: Ksh 5,000/month\nPremium: Ksh 8,000/month\n\n**Yearly plans** save you 2 months!',
      'ask_location': '📍 **PowerGym Location:**\n123 Fitness Street, Workout City\n\n🅿️ Free parking available!',
      'ask_hours': '🕒 **PowerGym Hours:**\nMonday-Friday: 6:00 AM - 10:00 PM\nSaturday: 8:00 AM - 8:00 PM\nSunday: 8:00 AM - 6:00 PM',
      'ask_contact': '📞 **Contact Us:**\nPhone: +254 712 345 678\nWhatsApp: +254 712 345 678\nEmail: support@powergym.com',
      'ask_facilities': '🏋️ **Our Facilities:**\n\n• State-of-the-art cardio equipment\n• Full free weights area\n• Functional training zone\n• Yoga/Pilates studio\n• Locker rooms with showers',
      'ask_trial': 'Yes! We offer a **FREE 7-day trial** for new members. 🎉\n\nWould you like to start your trial?',
      'ask_bookings': '📱 **Booking is easy!**\n\n1. Download our app\n2. Log in with your membership\n3. Browse and book classes\n\nYou can also book at the front desk!',
      'ask_payment_issues': "I'm sorry to hear you're having payment issues. Please provide your transaction ID and I'll notify our finance team.",
      'ask_payment_methods': 'We accept:\n💳 Credit/Debit Cards\n📱 M-Pesa (Paybill: 123456)\n🏦 Bank Transfer\n🔄 Auto-Pay',
      'ask_refund': '💰 **Refund Policy:**\n\nRefunds processed within 5-7 business days. Cancellations before 1st of month get full refund.',
      'ask_technical_support': '🛠️ **Technical Support**\n\nTry logging out and back in, clearing cache, or updating the app. If issues persist, please tell me more.',
      'ask_escalate_to_admin': "I'll notify our support team immediately. Someone will contact you within 30 minutes.",
      'report_issue': "Thank you for reporting this. I've notified our facilities team. They'll address it within 24 hours.",
      'ask_diet_nutrition': '🥗 **Nutrition Services**\n\nWe have certified nutritionists who can help with weight loss, muscle building, and meal planning.',
      'complain_feedback': "We're sorry to hear that! Please share details and we'll make it right.",
      'thanks': "You're welcome! 😊 Let me know if you need anything else.",
      'bot_challenge': "I'm PowerGym's AI assistant! I can answer questions about memberships, classes, trainers, and more.",
      'affirm': "Great! What would you like to know more about?",
      'deny': 'No problem! Feel free to ask if you have any questions later.',
      'default': "I'm not sure I understand. You can ask me about:\n• Membership plans\n• Classes & schedule\n• Trainers\n• Location & hours\n• Contact info\n• Free trials"
    };

    return responses[intent] || responses.default;
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

      // ✅ UPDATED: Use correct Rasa endpoint (/model/parse) with proper payload
      const response = await axios.post(`${this.rasaUrl}/model/parse`, {
        text: message
      });

      console.log(`📥 Rasa response:`, JSON.stringify(response.data, null, 2));

      // Extract intent from response
      const intent = response.data.intent?.name || 'default';
      const confidence = response.data.intent?.confidence || 0;
      
      // Generate friendly response based on intent
      const botMessage = this.getResponseForIntent(intent, confidence, cleanName);

      // Store bot response in Redis
      await redis.rpush(`chat:${sessionId}`, JSON.stringify({
        type: 'bot',
        message: botMessage,
        timestamp: new Date().toISOString(),
        metadata: {
          intent,
          confidence,
          isMember
        }
      }));

      // Set expiry (24 hours)
      await redis.expire(`chat:${sessionId}`, 86400);

      console.log(`📤 Returning response to ${cleanName}:`, botMessage);

      return [botMessage];

    } catch (error) {
      console.error('❌ Rasa error:', error.response?.data || error.message);
      
      // Return a friendly error message
      return ["I'm having trouble connecting. Please try again in a moment."];
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
      
      return true;
    } catch (error) {
      console.error('❌ Notification error:', error);
      return false;
    }
  }

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