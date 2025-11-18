# SendGrid Email Configuration for NiaHealth

This document explains how to configure SendGrid for email functionality in the NiaHealth backend application.

## Overview

NiaHealth has been updated to use **SendGrid** as the email service provider instead of traditional SMTP. SendGrid offers better deliverability, advanced analytics, and easier scalability for transactional emails.

## Setup Instructions

### 1. Create SendGrid Account
1. Visit [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your account via email

### 2. Create API Key
1. Log into SendGrid dashboard
2. Go to **Settings** > **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access**
5. Give it a name (e.g., "NiaHealth-API-Key")
6. Under **Mail Send**, select **Full Access**
7. Click **Create & View**
8. **Copy the API key** (you won't be able to see it again!)

### 3. Verify Sender Identity
1. In SendGrid dashboard, go to **Settings** > **Sender Authentication**
2. Choose **Single Sender Verification** (for development)
3. Fill in your email details:
   - From Name: `NiaHealth`
   - From Email: `noreply@yourdomain.com` (use your domain)
   - Reply To: Your actual email
4. Complete verification process

### 4. Configure Environment Variables
Update your `.env` file with the following:

```bash
# Email Configuration (SendGrid)
SENDGRID_API_KEY=SG.your_actual_api_key_here
EMAIL_FROM="NiaHealth <noreply@yourdomain.com>"
EMAIL_FROM_NAME="NiaHealth"
EMAIL_FROM_ADDRESS="noreply@yourdomain.com"
```

**Important:** Replace the placeholders with your actual values:
- `SG.your_actual_api_key_here` → Your actual SendGrid API key
- `noreply@yourdomain.com` → Your verified sender email

## Features

### Email Types Supported
1. **OTP Verification Emails** - For account verification
2. **Appointment Confirmations** - Booking confirmations
3. **Medical Referral Notifications** - Patient referral alerts
4. **Health Alerts** - Community health notifications
5. **General Transactional Emails** - Custom messages

### Advanced Features
- **Bulk Email Support** - Send multiple emails at once
- **Template Support** - Use SendGrid dynamic templates
- **Error Handling** - Comprehensive error reporting
- **HTML & Text** - Dual-format emails for compatibility

## Email Functions

### Basic Email
```javascript
const { sendEmail } = require('./src/config/email');

await sendEmail({
  to: 'patient@example.com',
  subject: 'Welcome to NiaHealth',
  html: '<h1>Welcome!</h1>',
  text: 'Welcome to NiaHealth'
});
```

### OTP Verification
```javascript
const { sendOTPEmail } = require('./src/config/email');

await sendOTPEmail('patient@example.com', '123456', 'John Doe');
```

### Appointment Confirmation
```javascript
const { sendAppointmentEmail } = require('./src/config/email');

await sendAppointmentEmail('patient@example.com', {
  patientName: 'John Doe',
  clinicName: 'Central Health Clinic',
  date: '2025-11-15',
  time: '10:30 AM',
  reason: 'Regular Checkup',
  appointmentId: 'APT001'
});
```

### Medical Referral
```javascript
const { sendReferralEmail } = require('./src/config/email');

await sendReferralEmail('patient@example.com', {
  patientName: 'John Doe',
  hospitalName: 'City General Hospital',
  reason: 'Cardiac consultation',
  urgency: 'high',
  referralDate: '2025-11-15',
  referralId: 'REF001'
});
```

### Health Alert
```javascript
const { sendHealthAlert } = require('./src/config/email');

await sendHealthAlert('patient@example.com', {
  title: 'Vaccination Drive',
  message: 'COVID-19 boosters available at your local clinic',
  priority: 'medium'
});
```

## Testing

### Test Email Configuration
The app will automatically test the SendGrid configuration on startup:
- ✅ Success: "SendGrid email service configured successfully"
- ⚠️ Warning: "SendGrid API key not configured - email features disabled"

### Development Mode
If no API key is configured, the app will:
- Continue running normally
- Show warning messages instead of errors
- Log email attempts without sending

## Production Considerations

### Domain Authentication (Recommended)
For production, set up domain authentication:
1. In SendGrid: **Settings** > **Sender Authentication**
2. Choose **Domain Authentication**
3. Follow DNS setup instructions
4. This improves deliverability and removes "via sendgrid.net"

### Email Templates
For consistent branding, consider creating SendGrid templates:
1. **Settings** > **Dynamic Templates**
2. Create branded templates
3. Use `sendTemplateEmail()` function

### Monitoring
Monitor your emails in SendGrid dashboard:
- **Activity** tab shows delivery status
- **Stats** shows open/click rates
- **Suppressions** shows bounces/spam reports

## Troubleshooting

### Common Issues

**1. "Forbidden" Error**
- Check API key permissions
- Ensure Mail Send has "Full Access"

**2. "The from email address is not verified"**
- Complete Single Sender Verification
- Wait for verification email and confirm

**3. "Invalid API Key"**
- Regenerate API key in SendGrid dashboard
- Update .env file with new key

**4. Emails Going to Spam**
- Set up domain authentication
- Use verified sender email
- Avoid spam trigger words

### Debug Mode
For debugging, check console logs:
```bash
npm run dev
# Look for email-related logs
```

## Security Notes

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate API keys** periodically
4. **Monitor usage** for unusual activity
5. **Use least privilege** for API key permissions

## Support

- **SendGrid Docs:** [docs.sendgrid.com](https://docs.sendgrid.com)
- **NiaHealth Issues:** Contact development team
- **Email Deliverability:** Check SendGrid Activity feed

---

**Last Updated:** November 12, 2025  
**Version:** 1.0.0