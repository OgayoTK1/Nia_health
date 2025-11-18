// Example SendGrid Email Usage for NiaHealth
// This file demonstrates how to use the SendGrid email functionality

const {
  sendEmail,
  sendOTPEmail,
  sendAppointmentEmail,
  sendReferralEmail,
  sendHealthAlert,
  sendBulkEmail,
  sendTemplateEmail
} = require('./src/config/email');

// Example 1: Basic Email
async function sendBasicEmail() {
  try {
    const result = await sendEmail({
      to: 'patient@example.com',
      subject: 'Welcome to NiaHealth',
      html: `
        <h1>Welcome to NiaHealth!</h1>
        <p>Thank you for joining our community health platform.</p>
        <p>Your health journey starts here.</p>
      `,
      text: 'Welcome to NiaHealth! Thank you for joining our community health platform.'
    });

    if (result.success) {
      console.log('✅ Basic email sent successfully');
    } else {
      console.log('❌ Failed to send basic email:', result.error);
    }
  } catch (error) {
    console.error('Error sending basic email:', error);
  }
}

// Example 2: OTP Verification Email
async function sendOTPExample() {
  try {
    const result = await sendOTPEmail(
      'patient@example.com',  // recipient email
      '123456',               // OTP code
      'John Doe'              // patient name
    );

    if (result.success) {
      console.log('✅ OTP email sent successfully');
    } else {
      console.log('❌ Failed to send OTP:', result.error);
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
}

// Example 3: Appointment Confirmation Email
async function sendAppointmentExample() {
  try {
    const appointmentData = {
      patientName: 'Jane Smith',
      clinicName: 'Central Health Clinic',
      date: '2025-11-20',
      time: '10:30 AM',
      reason: 'Regular Checkup',
      appointmentId: 'APT-2025-001'
    };

    const result = await sendAppointmentEmail('patient@example.com', appointmentData);

    if (result.success) {
      console.log('✅ Appointment confirmation sent successfully');
    } else {
      console.log('❌ Failed to send appointment confirmation:', result.error);
    }
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
  }
}

// Example 4: Medical Referral Email
async function sendReferralExample() {
  try {
    const referralData = {
      patientName: 'Michael Johnson',
      hospitalName: 'City General Hospital',
      reason: 'Cardiac consultation required',
      urgency: 'high',
      referralDate: '2025-11-15',
      referralId: 'REF-2025-001'
    };

    const result = await sendReferralEmail('patient@example.com', referralData);

    if (result.success) {
      console.log('✅ Medical referral sent successfully');
    } else {
      console.log('❌ Failed to send referral:', result.error);
    }
  } catch (error) {
    console.error('Error sending referral:', error);
  }
}

// Example 5: Health Alert Email
async function sendAlertExample() {
  try {
    const alertData = {
      title: 'Vaccination Drive',
      message: `
        <p>A COVID-19 vaccination drive is scheduled for this weekend at your local clinic.</p>
        <ul>
          <li><strong>Date:</strong> November 18-19, 2025</li>
          <li><strong>Time:</strong> 9:00 AM - 5:00 PM</li>
          <li><strong>Location:</strong> Community Health Center</li>
        </ul>
        <p>No appointment necessary. Bring your ID and vaccination card.</p>
      `,
      priority: 'medium'
    };

    const result = await sendHealthAlert('community@example.com', alertData);

    if (result.success) {
      console.log('✅ Health alert sent successfully');
    } else {
      console.log('❌ Failed to send health alert:', result.error);
    }
  } catch (error) {
    console.error('Error sending health alert:', error);
  }
}

// Example 6: Bulk Email (Multiple Recipients)
async function sendBulkEmailExample() {
  try {
    const messages = [
      {
        to: 'patient1@example.com',
        subject: 'Appointment Reminder',
        html: '<p>Your appointment is tomorrow at 2:00 PM</p>'
      },
      {
        to: 'patient2@example.com',
        subject: 'Appointment Reminder', 
        html: '<p>Your appointment is tomorrow at 3:00 PM</p>'
      },
      {
        to: 'patient3@example.com',
        subject: 'Appointment Reminder',
        html: '<p>Your appointment is tomorrow at 4:00 PM</p>'
      }
    ];

    const result = await sendBulkEmail(messages);

    if (result.success) {
      console.log(`✅ Bulk email sent successfully to ${result.count} recipients`);
    } else {
      console.log('❌ Failed to send bulk email:', result.error);
    }
  } catch (error) {
    console.error('Error sending bulk email:', error);
  }
}

// Example 7: SendGrid Template Email (requires template setup in SendGrid)
async function sendTemplateEmailExample() {
  try {
    const result = await sendTemplateEmail({
      to: 'patient@example.com',
      templateId: 'd-1234567890abcdef', // Your SendGrid template ID
      dynamicTemplateData: {
        patient_name: 'John Doe',
        clinic_name: 'Health Center',
        appointment_date: '2025-11-20',
        appointment_time: '10:30 AM'
      }
    });

    if (result.success) {
      console.log('✅ Template email sent successfully');
    } else {
      console.log('❌ Failed to send template email:', result.error);
    }
  } catch (error) {
    console.error('Error sending template email:', error);
  }
}

// Usage in Express Routes
// You can use these functions in your API routes like this:

// POST /api/auth/send-otp
async function handleSendOTP(req, res) {
  try {
    const { email, name } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    
    // Store OTP in database/cache (implementation depends on your storage)
    // await storeOTP(email, otp);
    
    const result = await sendOTPEmail(email, otp, name);
    
    if (result.success) {
      res.json({ success: true, message: 'OTP sent successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
  } catch (error) {
    console.error('OTP sending error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// POST /api/appointments/confirm
async function handleAppointmentConfirmation(req, res) {
  try {
    const { appointmentId } = req.params;
    
    // Get appointment details from database
    // const appointment = await getAppointmentById(appointmentId);
    
    const appointmentData = {
      patientName: 'Patient Name', // From database
      clinicName: 'Clinic Name',   // From database
      date: '2025-11-20',          // From database
      time: '10:30 AM',            // From database
      reason: 'Checkup',           // From database
      appointmentId: appointmentId
    };
    
    const result = await sendAppointmentEmail('patient@email.com', appointmentData);
    
    if (result.success) {
      res.json({ success: true, message: 'Confirmation email sent' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send confirmation' });
    }
  } catch (error) {
    console.error('Appointment confirmation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = {
  sendBasicEmail,
  sendOTPExample,
  sendAppointmentExample,
  sendReferralExample,
  sendAlertExample,
  sendBulkEmailExample,
  sendTemplateEmailExample,
  handleSendOTP,
  handleAppointmentConfirmation
};

// To test these examples, you can run:
// node examples/sendgrid-examples.js