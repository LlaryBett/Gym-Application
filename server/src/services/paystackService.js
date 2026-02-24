// server/src/services/paystackService.js
import axios from 'axios';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL;

class PaystackService {
  constructor() {
    this.baseURL = 'https://api.paystack.co';
    this.headers = {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  // Initialize transaction for membership purchase
  async initializeTransaction({ email, amount, metadata }) {
    try {
      console.log('💰 Initializing Paystack transaction for:', email);
      
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Convert to kobo/cents
          currency: 'KES',
          callback_url: CALLBACK_URL,
          metadata,
          channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money']
        },
        { headers: this.headers }
      );

      console.log('✅ Transaction initialized:', response.data.data.reference);
      
      return {
        success: true,
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference
      };
    } catch (error) {
      console.error('❌ Paystack init error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Verify transaction after payment
  async verifyTransaction(reference) {
    try {
      console.log('🔍 Verifying transaction:', reference);
      
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        { headers: this.headers }
      );

      console.log('✅ Transaction verified:', response.data.data.status);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Paystack verify error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(signature, payload) {
    try {
      const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      return hash === signature;
    } catch (error) {
      console.error('❌ Webhook signature verification error:', error);
      return false;
    }
  }
}

export default new PaystackService();