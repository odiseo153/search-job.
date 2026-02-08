/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages/', '<rootDir>/apps/'],
  testMatch: ['**/__tests__/**/*.e2e-spec.ts', '**/__tests__/**/*.spec.ts'],
  moduleNameMapper: {
    '^@ever-jobs/models$': '<rootDir>/packages/models/src/index.ts',
    '^@ever-jobs/common$': '<rootDir>/packages/common/src/index.ts',
    '^@ever-jobs/analytics$': '<rootDir>/packages/analytics/src/index.ts',
    '^@ever-jobs/source-linkedin$': '<rootDir>/packages/source-linkedin/src/index.ts',
    '^@ever-jobs/source-indeed$': '<rootDir>/packages/source-indeed/src/index.ts',
    '^@ever-jobs/source-glassdoor$': '<rootDir>/packages/source-glassdoor/src/index.ts',
    '^@ever-jobs/source-ziprecruiter$': '<rootDir>/packages/source-ziprecruiter/src/index.ts',
    '^@ever-jobs/source-google$': '<rootDir>/packages/source-google/src/index.ts',
    '^@ever-jobs/source-bayt$': '<rootDir>/packages/source-bayt/src/index.ts',
    '^@ever-jobs/source-naukri$': '<rootDir>/packages/source-naukri/src/index.ts',
    '^@ever-jobs/source-bdjobs$': '<rootDir>/packages/source-bdjobs/src/index.ts',
    '^@ever-jobs/source-internshala$': '<rootDir>/packages/source-internshala/src/index.ts',
    '^@ever-jobs/source-exa$': '<rootDir>/packages/source-exa/src/index.ts',
    '^@ever-jobs/source-upwork$': '<rootDir>/packages/source-upwork/src/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.base.json' }],
  },
  // E2E tests hit live APIs — give each test generous timeout
  testTimeout: 120_000,
  // Run test files sequentially to avoid rate-limiting
  maxWorkers: 1,
};
