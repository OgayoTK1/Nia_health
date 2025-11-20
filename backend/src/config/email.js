// Email Configuration - SendGrid
const sgMail = require('@sendgrid/mail');
const path = require('path');

// Load environment (do not spam logs or leak secrets during tests)
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Debug flag: opt-in verbose logs only in development and when EMAIL_DEBUG=true
const DEBUG = process.env.NODE_ENV !== 'test' && process.env.EMAIL_DEBUG === 'true';
if (DEBUG) {
  console.log('🔍 Email config loaded from:', path.join(__dirname, '../../.env'));
  const key = process.env.SENDGRID_API_KEY || '';
  const masked = key ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : '(not set)';
  console.log('🔍 SENDGRID_API_KEY present:', !!key, '| masked:', masked);
}

// Configure SendGrid
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Default sender configuration
const DEFAULT_FROM = {
  email: process.env.EMAIL_FROM_ADDRESS || 'noreply@niahealth.com',
  name: process.env.EMAIL_FROM_NAME || 'NiaHealth'
};

// Verify SendGrid configuration
const verifyEmailConfig = async () => {
  try {
    if (DEBUG) {
      console.log('🔍 Debug - API Key check:', {
        exists: !!process.env.SENDGRID_API_KEY,
        startsWithSG: process.env.SENDGRID_API_KEY?.startsWith('SG.'),
        length: process.env.SENDGRID_API_KEY?.length
      });
    }

    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      if (DEBUG) {
        console.log('⚠️  SendGrid API key not properly configured - email features disabled');
        console.log('   Please set SENDGRID_API_KEY in .env file (should start with SG.)');
      }
      return false;
    }
    
    if (DEBUG) {
      console.log('✅ SendGrid email service configured successfully');
    }
    return true;
  } catch (error) {
    console.error('❌ SendGrid configuration error:', error.message);
    return false;
  }
};

// Send email helper
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      console.warn('⚠️ SendGrid API key not properly configured - email not sent');
      return { success: false, error: 'SendGrid API key not configured' };
    }

    // Ensure SendGrid always receives a non-empty `text` content value
    const fallbackText = (() => {
      if (text && String(text).trim().length) return String(text);
      if (html && String(html).trim().length) {
        // Strip tags to create a simple text fallback
        try {
          const stripped = String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          return stripped.length ? stripped.slice(0, 1000) : 'NiaHealth notification';
        } catch (e) {
          return 'NiaHealth notification';
        }
      }
      return 'NiaHealth notification';
    })();

    const msg = {
      to,
      from: DEFAULT_FROM,
      subject,
      html,
      text: fallbackText
    };

    const result = await sgMail.send(msg);
    if (DEBUG) {
      console.log('📧 Email sent successfully via SendGrid:', result[0].statusCode);
    }
    return { 
      success: true, 
      messageId: result[0].headers['x-message-id'],
      statusCode: result[0].statusCode 
    };
  } catch (error) {
    console.error('SendGrid email sending error:', error);
    
    // Handle SendGrid specific errors
    if (error.response) {
      console.error('SendGrid Response Body:', error.response.body);
      return { 
        success: false, 
        error: error.response.body.errors?.[0]?.message || error.message,
        statusCode: error.code
      };
    }
    
    return { success: false, error: error.message };
  }
};

// Send multiple emails (batch)
const sendBulkEmail = async (messages) => {
  try {
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      console.warn('⚠️ SendGrid API key not properly configured - bulk email not sent');
      return { success: false, error: 'SendGrid API key not configured' };
    }

    const formattedMessages = messages.map(msg => ({
      ...msg,
      from: msg.from || DEFAULT_FROM
    }));

    const result = await sgMail.send(formattedMessages);
    if (DEBUG) {
      console.log(`📧 Bulk email sent successfully: ${formattedMessages.length} emails`);
    }
    return { success: true, count: formattedMessages.length, result };
  } catch (error) {
    console.error('SendGrid bulk email error:', error);
    return { success: false, error: error.message };
  }
};

// Send email with template (SendGrid Dynamic Templates)
const sendTemplateEmail = async ({ to, templateId, dynamicTemplateData, subject = null }) => {
  try {
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      console.warn('⚠️ SendGrid API key not properly configured - template email not sent');
      return { success: false, error: 'SendGrid API key not configured' };
    }

    const msg = {
      to,
      from: DEFAULT_FROM,
      templateId,
      dynamicTemplateData
    };

    // Subject is optional when using templates (can be set in template)
    if (subject) {
      msg.subject = subject;
    }

    const result = await sgMail.send(msg);
    if (DEBUG) {
      console.log('📧 Template email sent successfully via SendGrid:', result[0].statusCode);
    }
    return { 
      success: true, 
      messageId: result[0].headers['x-message-id'],
      statusCode: result[0].statusCode 
    };
  } catch (error) {
    console.error('SendGrid template email error:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP email
const sendOTPEmail = async (to, otp, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NiaHealth - Verification Code</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #059669, #065f46); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px;
          font-weight: 300;
        }
        .content { 
          padding: 40px 30px; 
          background: white; 
        }
        .otp-box { 
          background: #f8f9fa; 
          border: 3px solid #059669; 
          padding: 30px; 
          text-align: center; 
          margin: 30px 0;
          border-radius: 8px;
        }
        .otp-code { 
          font-size: 36px; 
          font-weight: bold; 
          color: #059669; 
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .footer { 
          text-align: center; 
          padding: 25px; 
          color: #666; 
          font-size: 14px;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }
        .warning { 
          color: #dc3545; 
          font-size: 14px; 
          margin-top: 20px;
        }
        .brand { 
          color: #059669; 
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 <span class="brand">NiaHealth</span></h1>
          <p>Community Health Monitoring System</p>
        </div>
        <div class="content">
          <h2>Hello ${name || 'User'},</h2>
          <p>Your One-Time Password (OTP) for account verification is:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This OTP is valid for <strong>10 minutes</strong></li>
            <li>Do not share this code with anyone</li>
            <li>If you didn't request this verification, please ignore this email</li>
          </ul>
          <p class="warning">⚠️ This is an automated message. Please do not reply to this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 <strong>NiaHealth</strong>. All rights reserved.</p>
          <p>Empowering Communities Through Digital Health Solutions</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textVersion = `
    NiaHealth - Account Verification
    
    Hello ${name || 'User'},
    
    Your verification code is: ${otp}
    
    This code expires in 10 minutes.
    If you didn't request this, please ignore this email.
    
    NiaHealth Team
  `;

  return sendEmail({
    to,
    subject: 'Your NiaHealth Verification Code',
    html,
    text: textVersion
  });
};

// Send appointment confirmation
const sendAppointmentEmail = async (to, appointmentData) => {
  const { patientName, clinicName, date, time, reason, appointmentId } = appointmentData;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmed - NiaHealth</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #059669, #065f46); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .appointment-details { 
          background: #f8f9fa; 
          padding: 25px; 
          margin: 25px 0; 
          border-left: 5px solid #059669;
          border-radius: 0 8px 8px 0;
        }
        .detail-row { 
          margin: 15px 0; 
          display: flex;
          align-items: center;
        }
        .label { 
          font-weight: bold; 
          color: #059669; 
          min-width: 120px;
        }
        .value {
          color: #333;
        }
        .appointment-id {
          font-family: 'Courier New', monospace;
          background: #e9ecef;
          padding: 5px 10px;
          border-radius: 4px;
        }
        .footer { 
          text-align: center; 
          padding: 25px; 
          color: #666; 
          font-size: 14px;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }
        .instructions {
          background: #e7f3ff;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #0066cc;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Appointment Confirmed</h1>
          <p>NiaHealth Community Health System</p>
        </div>
        <div class="content">
          <h2>Hello ${patientName},</h2>
          <p>Your appointment has been successfully scheduled and confirmed.</p>
          
          <div class="appointment-details">
            <div class="detail-row">
              <span class="label">Clinic:</span> 
              <span class="value">${clinicName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span> 
              <span class="value">${date}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span> 
              <span class="value">${time}</span>
            </div>
            ${appointmentId ? `
            <div class="detail-row">
              <span class="label">Ref ID:</span> 
              <span class="value appointment-id">${appointmentId}</span>
            </div>
            ` : ''}
            ${reason ? `
            <div class="detail-row">
              <span class="label">Purpose:</span> 
              <span class="value">${reason}</span>
            </div>
            ` : ''}
          </div>

          <div class="instructions">
            <h3>📋 Important Instructions:</h3>
            <ul>
              <li>Please arrive <strong>15 minutes before</strong> your scheduled time</li>
              <li>Bring a valid ID and any relevant medical documents</li>
              <li>If you need to reschedule, please log into your NiaHealth account</li>
              <li>Contact the clinic directly for urgent changes</li>
            </ul>
          </div>

          <p>We look forward to serving you at NiaHealth.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 <strong>NiaHealth</strong>. All rights reserved.</p>
          <p>Building healthier communities together</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Appointment Confirmation - NiaHealth',
    html
  });
};

// Send referral notification
const sendReferralEmail = async (to, referralData) => {
  const { patientName, hospitalName, reason, urgency, referralDate, referralId } = referralData;
  
  const urgencyColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };

  const urgencyEmojis = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Medical Referral - NiaHealth</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #059669, #065f46); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .referral-details { 
          background: white; 
          padding: 25px; 
          margin: 25px 0; 
          border-left: 5px solid ${urgencyColors[urgency] || '#059669'};
          border-radius: 0 8px 8px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .urgency-badge { 
          display: inline-block; 
          padding: 8px 16px; 
          background: ${urgencyColors[urgency] || '#059669'}; 
          color: white; 
          border-radius: 25px; 
          font-weight: bold; 
          text-transform: uppercase; 
          font-size: 12px;
          margin: 10px 0;
        }
        .detail-row { 
          margin: 15px 0; 
          display: flex;
          align-items: flex-start;
        }
        .label { 
          font-weight: bold; 
          color: #059669; 
          min-width: 120px;
        }
        .value {
          color: #333;
          flex: 1;
        }
        .referral-id {
          font-family: 'Courier New', monospace;
          background: #e9ecef;
          padding: 5px 10px;
          border-radius: 4px;
        }
        .footer { 
          text-align: center; 
          padding: 25px; 
          color: #666; 
          font-size: 14px;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }
        .next-steps {
          background: #fff3cd;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #ffc107;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Medical Referral</h1>
          <p>NiaHealth Community Health System</p>
        </div>
        <div class="content">
          <h2>Hello ${patientName},</h2>
          <p>You have been referred to a specialist healthcare facility for further medical attention.</p>
          
          <div class="referral-details">
            <div style="text-align: center; margin-bottom: 20px;">
              <span class="urgency-badge">
                ${urgencyEmojis[urgency] || '🔵'} ${urgency ? urgency.toUpperCase() : 'MEDIUM'} PRIORITY
              </span>
            </div>
            
            <div class="detail-row">
              <span class="label">Hospital:</span> 
              <span class="value"><strong>${hospitalName}</strong></span>
            </div>
            <div class="detail-row">
              <span class="label">Referral Date:</span> 
              <span class="value">${referralDate}</span>
            </div>
            ${referralId ? `
            <div class="detail-row">
              <span class="label">Referral ID:</span> 
              <span class="value referral-id">${referralId}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Reason:</span> 
              <span class="value">${reason}</span>
            </div>
          </div>

          <div class="next-steps">
            <h3>📋 Next Steps:</h3>
            <ol>
              <li><strong>Contact the hospital</strong> as soon as possible to schedule your visit</li>
              <li><strong>Bring this referral</strong> and any medical documents from your visit</li>
              <li><strong>Arrive early</strong> for your appointment with proper identification</li>
              ${urgency === 'critical' || urgency === 'high' ? 
                '<li style="color: #dc2626;"><strong>⚠️ This is a priority referral - please seek immediate attention</strong></li>' : 
                ''}
            </ol>
          </div>

          <p>If you have any questions about this referral, please contact your healthcare provider.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 <strong>NiaHealth</strong>. All rights reserved.</p>
          <p>Your health, our priority</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `${urgencyEmojis[urgency] || '🔵'} Medical Referral to ${hospitalName} - NiaHealth`,
    html
  });
};

// Send health alert
const sendHealthAlert = async (to, alertData) => {
  const { title, message, priority = 'medium' } = alertData;
  
  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };

  const priorityEmojis = {
    low: '📋',
    medium: '⚠️',
    high: '🚨',
    critical: '🚨'
  };
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Health Alert - NiaHealth</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, ${priorityColors[priority]}, #065f46); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .message-box { 
          background: white; 
          padding: 25px; 
          margin: 25px 0; 
          border-left: 5px solid ${priorityColors[priority]};
          border-radius: 0 8px 8px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .priority-badge {
          display: inline-block;
          padding: 8px 16px;
          background: ${priorityColors[priority]};
          color: white;
          border-radius: 25px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
          margin-bottom: 15px;
        }
        .footer { 
          text-align: center; 
          padding: 25px; 
          color: #666; 
          font-size: 14px;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${priorityEmojis[priority]} Health Alert</h1>
          <p>NiaHealth Community Health System</p>
        </div>
        <div class="content">
          <div class="message-box">
            <div style="text-align: center; margin-bottom: 20px;">
              <span class="priority-badge">${priority.toUpperCase()} PRIORITY</span>
            </div>
            <h2>${title}</h2>
            <div style="margin: 20px 0;">${message}</div>
          </div>
          <p><strong>Stay informed, stay healthy.</strong></p>
          <p>This alert was sent to keep you updated about important health information in your community.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 <strong>NiaHealth</strong>. All rights reserved.</p>
          <p>Protecting community health together</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `${priorityEmojis[priority]} Health Alert: ${title}`,
    html
  });
};

module.exports = {
  sgMail,
  verifyEmailConfig,
  sendEmail,
  sendBulkEmail,
  sendTemplateEmail,
  sendOTPEmail,
  sendAppointmentEmail,
  sendReferralEmail,
  sendHealthAlert
};