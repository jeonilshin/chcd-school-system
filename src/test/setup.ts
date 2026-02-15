import { beforeAll, afterAll, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView for Radix UI Select component
Element.prototype.scrollIntoView = function() {};

// Polyfill File.arrayBuffer() for Node.js test environment
if (typeof File !== 'undefined' && !File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = async function() {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

// Setup runs before all tests
beforeAll(async () => {
  // Initialize test environment
});

// Cleanup runs after each test
afterEach(async () => {
  // Clean up test data
});

// Teardown runs after all tests
afterAll(async () => {
  // Close connections
});
