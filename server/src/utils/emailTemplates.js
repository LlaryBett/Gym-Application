// server/src/utils/emailTemplates.js

export const emailTemplates = {
  // Welcome email for new members
  welcome: (member) => ({
    subject: `🎉 Welcome to ${process.env.COMPANY_NAME || 'PowerGym'} Family, ${member.first_name}!`,
    htmlContent: `
      <div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; background-color: #fff8f1">
        <div style="max-width: 600px; margin: auto; padding: 16px">
          
          <!-- Header with Logo and PowerGym Text -->
          <a style="text-decoration: none; outline: none; display: flex; align-items: center; gap: 8px; margin-bottom: 20px;" href="${process.env.WEBSITE_URL || 'http://localhost:3000'}" target="_blank">
            <img
              style="height: 40px; width: 40px; border-radius: 50%; object-fit: cover; vertical-align: middle"
              height="40px"
              width="40px"
              src="${process.env.LOGO_URL || 'cid:logo.png'}"
              alt="${process.env.COMPANY_NAME || 'PowerGym'}"
            />
            <span style="font-size: 20px; font-weight: bold; color: #262626;">
              Power<span style="color: #f97316;">Gym</span>
            </span>
          </a>
          
          <p>Welcome to the ${process.env.COMPANY_NAME || 'PowerGym'} family! We're excited to have you on board.</p>
          <p>
            Your account has been successfully created, and you're now ready to explore all the great
            features we offer.
          </p>
          <p>
            <a
              style="
                display: inline-block;
                text-decoration: none;
                outline: none;
                color: #fff;
                background-color: #f97316;
                padding: 8px 16px;
                border-radius: 4px;
              "
              href="${process.env.WEBSITE_URL || 'http://localhost:3000'}/dashboard"
              target="_blank"
            >
              Open ${process.env.COMPANY_NAME || 'PowerGym'}
            </a>
          </p>
          <p>
            If you have any questions or need help getting started, our support team is just an email away
            at
            <a href="mailto:${process.env.COMPANY_EMAIL || 'support@gymapp.com'}" style="text-decoration: none; outline: none; color: #f97316">
              ${process.env.COMPANY_EMAIL || 'support@gymapp.com'}
            </a>. We're here to assist you every step of the way!
          </p>
          <p>Best regards,<br />The ${process.env.COMPANY_NAME || 'PowerGym'} Team</p>
        </div>
      </div>
    `,
    textContent: `
      Welcome to the ${process.env.COMPANY_NAME || 'PowerGym'} family, ${member.first_name}!
      
      Your account has been successfully created, and you're now ready to explore all the great features we offer.
      
      Open ${process.env.COMPANY_NAME || 'PowerGym'}: ${process.env.WEBSITE_URL || 'http://localhost:3000'}/dashboard
      
      If you have any questions or need help getting started, our support team is just an email away at ${process.env.COMPANY_EMAIL || 'support@gymapp.com'}. We're here to assist you every step of the way!
      
      Best regards,
      The ${process.env.COMPANY_NAME || 'PowerGym'} Team
    `
  }),

  // Admin notification for new registration
  adminNotification: (member) => ({
    subject: '🆕 New Member Registration - Action Required',
    htmlContent: `
      <div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; background-color: #fff8f1">
        <div style="max-width: 600px; margin: auto; padding: 16px">
          
          <!-- Header with Logo and PowerGym Text -->
          <a style="text-decoration: none; outline: none; display: flex; align-items: center; gap: 8px; margin-bottom: 20px;" href="${process.env.WEBSITE_URL || 'http://localhost:3000'}" target="_blank">
            <img
              style="height: 40px; width: 40px; border-radius: 50%; object-fit: cover; vertical-align: middle"
              height="40px"
              width="40px"
              src="${process.env.LOGO_URL || 'cid:logo.png'}"
              alt="${process.env.COMPANY_NAME || 'PowerGym'}"
            />
            <span style="font-size: 20px; font-weight: bold; color: #262626;">
              Power<span style="color: #f97316;">Gym</span>
            </span>
          </a>
          
          <h2 style="color: #f97316; margin-bottom: 20px;">New Member Registration</h2>
          <p>A new member has registered and requires review.</p>
          
          <div style="background-color: white; padding: 16px; border-radius: 4px; margin: 20px 0; border-left: 3px solid #f97316;">
            <h3 style="margin-top: 0; color: #333;">Member Details:</h3>
            <p><strong>Name:</strong> ${member.first_name} ${member.last_name}</p>
            <p><strong>Email:</strong> <a href="mailto:${member.email}" style="color: #f97316;">${member.email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${member.cell_phone}" style="color: #f97316;">${member.cell_phone}</a></p>
            <p><strong>Membership Number:</strong> ${member.membership_number}</p>
            <p><strong>Membership Type:</strong> ${member.membership_type || 'Regular'}</p>
            <p><strong>How heard:</strong> ${member.hear_about_us || 'Not specified'}</p>
            ${member.inquiry ? `<p><strong>Inquiry:</strong> ${member.inquiry}</p>` : ''}
            <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>
            <a
              style="
                display: inline-block;
                text-decoration: none;
                outline: none;
                color: #fff;
                background-color: #f97316;
                padding: 8px 16px;
                border-radius: 4px;
              "
              href="${process.env.ADMIN_URL || 'http://localhost:3000/admin'}/members/${member.id}"
              target="_blank"
            >
              Review Application
            </a>
          </p>
        </div>
      </div>
    `
  })
};