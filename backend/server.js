// Server Entry Point
require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/config/logger');
const { testConnection } = require('./src/config/db');
const { verifyEmailConfig } = require('./src/config/email');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Ensure backups directory exists
const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

// Helper: wait for DB with retry (prevents crash loops)
const waitForDatabase = async (retries = 10, delayMs = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const ok = await testConnection();
    if (ok) return true;
    console.warn(`⚠️  Database not ready (attempt ${attempt}/${retries}). Retrying in ${delayMs}ms...`);
    await new Promise((res) => setTimeout(res, delayMs));
  }
  return false;
};

// Start server
const startServer = async () => {
  try {
    // Test database connection with retries
    const dbConnected = await waitForDatabase(10, 2000);
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Verify email configuration (optional - don't exit if fails)
    await verifyEmailConfig();

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info('NiaHealth API started', {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        health: `/health`,
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.warn('SIGTERM received: shutting down');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.warn('SIGINT received: graceful shutdown');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Start the server
startServer();
