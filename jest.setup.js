// Jest setup file - ES Module version
// Runs before all tests

// Setup environment variables for testing
process.env.SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Extend Jest matchers
import '@testing-library/jest-dom';

// Mock window.matchMedia for React components
global.window = global.window || {};
Object.defineProperty(global.window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Suppress console errors in tests (optional)
const originalError = console.error;
global.beforeAll = global.beforeAll || (() => {});
global.afterAll = global.afterAll || (() => {});

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
     args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};
