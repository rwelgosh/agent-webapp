/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    // Handle module aliases (if you configured any in tsconfig)
    '^@/(.*)$': '<rootDir>/src/$1',
    // Handle CSS imports (with CSS modules)
    '\\.css$': 'identity-obj-proxy',
  },
  transform: {
    // Use ts-jest for TypeScript files
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  // Coverage config
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/setupTests.ts',
  ],
  coverageDirectory: 'coverage',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}',
  ],
}; 