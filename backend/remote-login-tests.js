const https = require('https');

const tests = [
  {
    name: 'HW - correct creds',
    path: '/api/auth/login/health-worker',
    body: { email: 'ogayoater@gmail.com', password: 'Ogayo@1235' },
    headers: {},
  },
  {
    name: 'HW - wrong password',
    path: '/api/auth/login/health-worker',
    body: { email: 'ogayoater@gmail.com', password: 'wrongpass' },
    headers: {},
  },
  {
    name: 'HW - non-existent email',
    path: '/api/auth/login/health-worker',
    body: { email: 'noone@example.com', password: 'whatever' },
    headers: {},
  },
  {
    name: 'HW - browser-like headers',
    path: '/api/auth/login/health-worker',
    body: { email: 'ogayoater@gmail.com', password: 'Ogayo@1235' },
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
  },
  {
    name: 'Patient - same creds',
    path: '/api/auth/login/patient',
    body: { email: 'ogayoater@gmail.com', password: 'Ogayo@1235' },
    headers: {},
  },
];

async function runTest(t) {
  return new Promise((resolve) => {
    const data = JSON.stringify(t.body);
    const options = {
      hostname: 'nia-health.onrender.com',
      port: 443,
      path: t.path,
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }, t.headers),
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => (body += d.toString()));
      res.on('end', () => {
        resolve({ name: t.name, statusCode: res.statusCode, body });
      });
    });

    req.on('error', (e) => {
      resolve({ name: t.name, error: e.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ name: t.name, error: 'timeout' });
    });

    req.write(data);
    req.end();
  });
}

(async () => {
  for (const t of tests) {
    process.stdout.write(`Running: ${t.name}... `);
    const res = await runTest(t);
    console.log('\nRESULT:', JSON.stringify(res, null, 2), '\n------------------------');
  }
})();
