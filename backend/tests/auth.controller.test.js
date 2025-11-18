const { loginPatient } = require('../src/controllers/authController');

jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

jest.mock('../src/config/jwt', () => ({
  generateTokens: jest.fn(() => ({ accessToken: 'acc', refreshToken: 'ref' }))
}));

jest.mock('../src/config/email', () => ({
  sendOTPEmail: jest.fn()
}));

jest.mock('../src/middleware/security', () => ({
  checkAccountLockout: jest.fn(async () => ({ isLocked: false, message: '' })),
  updateFailedLoginAttempts: jest.fn(async () => {}),
  resetFailedLoginAttempts: jest.fn(async () => {}),
  generateOTP: jest.fn(() => '123456')
}));

jest.mock('../src/middleware/audit', () => ({
  logAudit: jest.fn(async () => {})
}));

const { query } = require('../src/config/db');
const bcrypt = require('bcrypt');

const call = (handler, { body = {}, user = null } = {}) => {
  const req = { body, user, ip: '127.0.0.1', headers: {}, method: 'POST', originalUrl: '/api/auth' };
  const res = { statusCode: 200 };
  return new Promise((resolve, reject) => {
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (body) => { res.body = body; resolve(res); return res; };
    const next = (err) => { if (err) reject(err); };
    try {
      handler(req, res, next);
    } catch (e) {
      reject(e);
    }
  });
};

describe('authController.loginPatient with DB mocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 200 with tokens when patient verified and password matches', async () => {
    // Arrange DB mock for select patient and insert refresh token
    query.mockImplementation(async (sql, params) => {
      if (/SELECT \* FROM patients WHERE email = \?/i.test(sql)) {
        return [{ id: 42, email: 'p@example.com', name: 'Pat', phone: '123', password_hash: 'hash', is_verified: 1 }];
      }
      if (/INSERT INTO refresh_tokens/i.test(sql)) {
        return { insertId: 1 };
      }
      return [];
    });
    bcrypt.compare.mockResolvedValue(true);

    // Act
    const res = await call(loginPatient, { body: { email: 'p@example.com', password: 'secret' } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('accessToken', 'acc');
    expect(res.body.data).toHaveProperty('refreshToken', 'ref');
  });

  test('returns 403 and sends OTP when patient not verified', async () => {
    query.mockImplementation(async (sql, params) => {
      if (/SELECT \* FROM patients WHERE email = \?/i.test(sql)) {
        return [{ id: 7, email: 'p2@example.com', name: 'Unverified', password_hash: 'hash', is_verified: 0 }];
      }
      if (/UPDATE patients SET otp = \?, otp_expiry = \? WHERE id = \?/i.test(sql)) {
        return { affectedRows: 1 };
      }
      return [];
    });
    bcrypt.compare.mockResolvedValue(true);

    const res = await call(loginPatient, { body: { email: 'p2@example.com', password: 'secret' } });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('requiresVerification', true);
  });
});
