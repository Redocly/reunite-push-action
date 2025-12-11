import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: true,
    clearMocks: true,
    include: ['**/*.test.ts'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: process.env.CI ? ['text-summary'] : ['text', 'text-summary'],
      include: ['./src/**'],
      exclude: ['./src/__tests__/**'],
    },
  },
});
