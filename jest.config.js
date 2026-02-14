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
    '^@ever-jobs/source-ats-ashby$': '<rootDir>/packages/source-ats-ashby/src/index.ts',
    '^@ever-jobs/source-ats-greenhouse$': '<rootDir>/packages/source-ats-greenhouse/src/index.ts',
    '^@ever-jobs/source-ats-lever$': '<rootDir>/packages/source-ats-lever/src/index.ts',
    '^@ever-jobs/source-ats-workable$': '<rootDir>/packages/source-ats-workable/src/index.ts',
    '^@ever-jobs/source-ats-smartrecruiters$': '<rootDir>/packages/source-ats-smartrecruiters/src/index.ts',
    '^@ever-jobs/source-ats-rippling$': '<rootDir>/packages/source-ats-rippling/src/index.ts',
    '^@ever-jobs/source-ats-workday$': '<rootDir>/packages/source-ats-workday/src/index.ts',
    '^@ever-jobs/source-company-amazon$': '<rootDir>/packages/source-company-amazon/src/index.ts',
    '^@ever-jobs/source-company-apple$': '<rootDir>/packages/source-company-apple/src/index.ts',
    '^@ever-jobs/source-company-microsoft$': '<rootDir>/packages/source-company-microsoft/src/index.ts',
    '^@ever-jobs/source-company-nvidia$': '<rootDir>/packages/source-company-nvidia/src/index.ts',
    '^@ever-jobs/source-company-tiktok$': '<rootDir>/packages/source-company-tiktok/src/index.ts',
    '^@ever-jobs/source-company-uber$': '<rootDir>/packages/source-company-uber/src/index.ts',
    '^@ever-jobs/source-company-cursor$': '<rootDir>/packages/source-company-cursor/src/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.base.json' }],
    // Transform ESM-only packages (uuid v13+ ships as ESM .js)
    '[/\\\\]node_modules[/\\\\]uuid[/\\\\].+\\.js$': ['ts-jest', {
      tsconfig: 'tsconfig.base.json',
      diagnostics: false,
    }],
  },
  transformIgnorePatterns: [
    'node_modules[/\\\\](?!(uuid)[/\\\\])',
  ],
  // E2E tests hit live APIs — give each test generous timeout
  testTimeout: 120_000,
  // Run test files sequentially to avoid rate-limiting
  maxWorkers: 1,
};
