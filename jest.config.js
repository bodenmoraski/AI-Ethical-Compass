/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  // Default to node for API/unit tests. Component tests opt into jsdom via
  // /** @jest-environment jsdom */ at the top of the file.
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        // Component tests use jest-dom matchers; skip typechecking so matcher
        // augmentation quirks don't block the suite (runtime still works).
        diagnostics: false,
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          module: 'esnext',
          moduleResolution: 'node'
        }
      }
    ]
  },
  roots: ['<rootDir>/api', '<rootDir>/lib', '<rootDir>/client/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'api/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'client/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.config.js'
  ],
  testTimeout: 30000,
  verbose: true,
  bail: false,
  maxWorkers: '50%'
};
