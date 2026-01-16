module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  collectCoverageFrom: [
    'main.js',
    'renderer.js',
    '!node_modules/**'
  ]
};
