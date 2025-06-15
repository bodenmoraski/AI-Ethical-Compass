import { Buffer } from 'buffer';

// Make Buffer available globally
(globalThis as any).Buffer = Buffer;

// Add a minimal process polyfill for environment variables
if (typeof (globalThis as any).process === 'undefined') {
  (globalThis as any).process = {
    env: {
      // Add any environment variables that might be needed
      NODE_ENV: import.meta.env.MODE || 'development',
      ...import.meta.env
    }
  };
}

export {}; 