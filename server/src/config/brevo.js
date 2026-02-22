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

 async sendEmail({ 
  to, 
  subject, 
  htmlContent, 
  textContent, 
  sender = this.defaultSender, 
  params = {} 
}) {
  console.log("📨 ===== BREVO SEND START =====");
  console.log("➡️ To:", to);
  console.log("➡️ Subject:", subject);
  console.log("➡️ API Key exists?:", !!process.env.BREVO_API_KEY);
  console.log("➡️ Sender:", sender);

  try {
    const payload = {
      sender,
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent: textContent || undefined,
    };

    if (Object.keys(params).length > 0) {
      payload.params = params;
    }

    console.log("📦 Payload prepared");
    console.log("📡 Sending to Brevo...");

    const response = await this.client.transactionalEmails.sendTransacEmail(payload);

    console.log("✅ Brevo SUCCESS");
    console.log("📬 Response:", response);

    console.log("📨 ===== BREVO SEND END =====");

    return {
      success: true,
      messageId: response.messageId || response.id || 'sent',
      data: response
    };

  } catch (error) {
    console.log("❌ BREVO FAILED");
    console.error("❌ Full error:", error);
    console.error("❌ Error body:", error?.body);
    console.error("❌ Error response:", error?.response?.body);
    console.error("❌ Error message:", error?.message);

    console.log("📨 ===== BREVO SEND END (FAILED) =====");

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