const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const write = (level, message, meta) => {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  });
  fs.appendFile(path.join(logDir, 'app.log'), line + '\n', () => {});
  if (level === 'error') {
    console.error(message, meta || '');
  } else {
    console.log(message, meta || '');
  }
};

module.exports = {
  info: (msg, meta) => write('info', msg, meta),
  warn: (msg, meta) => write('warn', msg, meta),
  error: (msg, meta) => write('error', msg, meta),
};
