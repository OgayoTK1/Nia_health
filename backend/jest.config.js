module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 30000, // 30 second timeout for slow CI environments
  maxWorkers: 1, // Run tests serially to avoid race conditions in CI
};
