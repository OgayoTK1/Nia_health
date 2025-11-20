const https = require('https');

const data = JSON.stringify({ email: 'ogayoater@gmail.com', password: 'Ogayo@1235' });

const options = {
  hostname: 'nia-health.onrender.com',
  port: 443,
  path: '/api/auth/login/health-worker',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = https.request(options, (res) => {
  let body = '';
  console.log('statusCode:', res.statusCode);
  res.on('data', (d) => { body += d.toString(); });
  res.on('end', () => {
    console.log('response body:', body);
  });
});

req.on('error', (e) => { console.error('request error', e); });
req.write(data);
req.end();
