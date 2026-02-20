import { BrevoClient } from '@getbrevo/brevo';
import dotenv from 'dotenv';

dotenv.config();

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
  // Optional: timeout, retries, etc.
  timeout: 30000,
  retries: 3,
});

const defaultSender = {
  email: process.env.BREVO_SENDER_EMAIL || 'your-verified-sender@domain.com', // MUST be verified!
  name: process.env.BREVO_SENDER_NAME || 'PowerGym'
};

class BrevoService {
  constructor() {
    this.client = client;
    this.defaultSender = defaultSender;
    this.adminEmail = process.env.ADMIN_EMAIL || 'admin@gymapp.com';
  }

  async sendEmail({ to, subject, htmlContent, textContent, sender = this.defaultSender, params = {} }) {
  try {
    const payload = {
      sender,
      to: [{ email: to }],  // add name if you want: { email: to, name: 'User' }
      subject,
      htmlContent,
      textContent: textContent || undefined,
    };

    // ← Critical fix: omit params entirely if empty to avoid "params is blank"
    if (Object.keys(params).length > 0) {
      payload.params = params;
    }

    const response = await this.client.transactionalEmails.sendTransacEmail(payload);

    return {
      success: true,
      messageId: response.messageId || response.id || 'sent',  // sometimes it's .id or .messageId
      data: response
    };
  } catch (error) {
    // Improved logging: Brevo often puts details in error.body
    console.error('Brevo send error:', error?.body || error?.response?.body || error?.message || error);
    throw error;
  }
}

  // Optional: If you want account info later
  async getAccountInfo() {
    try {
      const response = await this.client.account.getAccount();
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Brevo account error:', error?.body || error?.message);
      throw error;
    }
  }
}

const brevoService = new BrevoService();
export default brevoService;