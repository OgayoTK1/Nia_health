// Express Application Setup
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const { helmetConfig, corsOptions, sanitizeInput, generalLimiter } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const referralRoutes = require('./routes/referralRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Create Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Debug: allow all CORS when DEBUG_ALLOW_ALL_CORS=true (safe temporary toggle)
if (process.env.DEBUG_ALLOW_ALL_CORS === 'true') {
  console.warn('⚠️ DEBUG_ALLOW_ALL_CORS enabled — allowing all origins for testing');
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });
}
// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (disabled during tests to keep output clean)
if (process.env.NODE_ENV !== 'test') {
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }
}

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use('/api/', generalLimiter);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'NiaHealth API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to NiaHealth API',
    version: '1.0.0',
    description: 'Community Health Monitoring and Referral System',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      appointments: '/api/appointments',
      referrals: '/api/referrals',
      clinics: '/api/clinics',
      admin: '/api/admin',
      feedback: '/api/feedback'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
