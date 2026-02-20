import brevoService from '../config/brevo.js';
import dotenv from 'dotenv';

dotenv.config();

async function testBrevo() {
  console.log('🚀 Starting Brevo Integration Test...');
  
  // Get the recipient from env or use a fallback for testing
  const testRecipient = process.env.ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL;
  
  console.log('-----------------------------------');
  console.log(`📧 Sender:    ${brevoService.defaultSender.email}`);
  console.log(`🎯 Recipient: ${testRecipient}`);
  console.log('-----------------------------------');

  try {
    // Test 1: Check account info (Validates API Key)
    console.log('\n🔍 Step 1: Checking account information...');
    const accountInfo = await brevoService.getAccountInfo();
    
    // The SDK returns data in the .body property (already handled in our config)
    console.log('✅ Connection Successful!');
    console.log(`📊 Account Email: ${accountInfo.data?.email || 'Authenticated'}`);

    // Test 2: Send a test email (Validates SMTP/Sender Permissions)
    console.log('\n📨 Step 2: Sending test email...');
    
    const testEmail = {
      to: testRecipient,
      subject: '🚀 Brevo System Test: SUCCESS',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
            .header { background: #0047FF; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #ffffff; }
            .footer { background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #777; }
            .badge { background: #28a745; color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Gym App Notification</h1>
            </div>
            <div class="content">
              <h2>System Check: <span class="badge">PASSED</span></h2>
              <p>Hello,</p>
              <p>This is a test email from your Gym Management application. If you are reading this, your <strong>Brevo API integration</strong> is working perfectly.</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div class="footer">
              Sent via Brevo API Client
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `Brevo is working! Test successful at ${new Date().toLocaleString()}`
    };

    const result = await brevoService.sendEmail(testEmail);
    
    console.log('✅ Email dispatched successfully!');
    console.log(`📬 Message ID: ${result.messageId}`);
    console.log('\n✨ All tests passed! Please check your inbox (and spam folder).');

  } catch (error) {
    console.error('\n❌ Test failed during execution:');
    
    // Handle specific Brevo error responses
    if (error.response?.body) {
      console.error('API Error Details:', JSON.stringify(error.response.body, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
    
    process.exit(1);
  }
}

// Run the test
testBrevo();