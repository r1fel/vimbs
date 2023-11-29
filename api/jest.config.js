/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // to not have to clear mocks in each and every describe block
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
