const { authenticate, isPatient } = require('../src/middleware/auth');

jest.mock('../src/config/jwt', () => ({
  verifyAccessToken: jest.fn(() => ({ id: 1, userType: 'patient', email: 'p@example.com' }))
}));

jest.mock('../src/config/db', () => ({
  query: jest.fn(async (sql, params) => {
    if (/FROM patients/i.test(sql)) {
      return [{ id: 1, name: 'Pat', email: 'p@example.com', is_verified: 1 }];
    }
    return [];
  })
}));

const makeRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
};

describe('auth middleware', () => {
  test('authenticate returns 401 when token missing', async () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = jest.fn();
    await authenticate(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(next).not.toHaveBeenCalled();
  });

  test('authenticate attaches user when valid token and patient exists', async () => {
    const req = { headers: { authorization: 'Bearer faketoken' } };
    const res = makeRes();
    const next = jest.fn();
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('p@example.com');
  });

  test('isPatient allows patient and blocks others', () => {
    const res = makeRes();
    const next = jest.fn();

    // allow
    const req1 = { user: { userType: 'patient', email: 'p@example.com' } };
    isPatient(req1, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    // deny
    const req2 = { user: { userType: 'health_worker', email: 'w@example.com' } };
    const res2 = makeRes();
    const next2 = jest.fn();
    isPatient(req2, res2, next2);
    expect(res2.statusCode).toBe(403);
    expect(next2).not.toHaveBeenCalled();
  });
});
