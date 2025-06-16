import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
        reporters: [
            'default',
            ['jest-summary-reporter', {
                failuresOnly: false,
                includeSuiteFailure: true,
                suiteLabel: '📦 Test Suite',
                testLabel: '🔹 Test',
                indent: 2,
            }]
        ],
        outputFile: {
            dot: './test-results.txt'
        }
    },
}); 