/**
 * Unit tests for error handling
 * 
 * Requirements: 1.6, 2.5
 * 
 * Tests:
 * - Error responses have correct format
 * - Validation errors include all invalid fields
 * - Sensitive data is not logged
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AppError,
  ValidationError,
  MultipleValidationErrors,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  DatabaseError,
  FileStorageError,
  ErrorType,
  formatErrorResponse,
  createValidationError,
  formatValidationErrors,
  logError,
  LogLevel,
} from '@/lib/error-handler';

describe('Error Handler', () => {
  // Mock console methods to capture logs
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Error Response Format', () => {
    it('should format ValidationError with correct structure', () => {
      // Requirement 1.6: Validation errors return consistent format
      const error = new ValidationError('email', 'Invalid email format', 'INVALID_EMAIL');
      const { response, statusCode } = formatErrorResponse(error);

      expect(statusCode).toBe(400);
      expect(response.success).toBe(false);
      expect(response.errors).toBeDefined();
      expect(response.errors).toHaveLength(1);
      expect(response.errors![0]).toEqual({
        field: 'email',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL',
      });
    });

    it('should format MultipleValidationErrors with all fields', () => {
      // Requirement 2.5: Validation errors include all invalid fields
      const errors = [
        { field: 'firstName', message: 'First Name is required' },
        { field: 'lastName', message: 'Last Name is required' },
        { field: 'email', message: 'Invalid email format', code: 'INVALID_EMAIL' },
      ];
      const error = new MultipleValidationErrors(errors);
      const { response, statusCode } = formatErrorResponse(error);

      expect(statusCode).toBe(400);
      expect(response.success).toBe(false);
      expect(response.errors).toBeDefined();
      expect(response.errors).toHaveLength(3);
      expect(response.errors).toEqual(errors);
    });

    it('should format UnauthorizedError correctly', () => {
      const error = new UnauthorizedError('Please log in');
      const { response, statusCode } = formatErrorResponse(error);

      expect(statusCode).toBe(401);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Please log in');
    });

    it('should format ForbiddenError correctly', () => {
      const error = new ForbiddenError('Access denied');
      const { response, statusCode } = formatErrorResponse(error);

      expect(statusCode).toBe(403);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Access denied');
    });

    it('should format NotFoundError correctly', () => {
      const error = new NotFoundError('Enrollment');
      const { response, statusCode } = formatErrorResponse(error);

      expect(statusCode).toBe(404);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Enrollment not found');
    });

    it('should format DatabaseError correctly', () => {
      const error = new DatabaseError('Connection failed');
      const { response, statusCode } = formatErrorResponse(error);

      expect(statusCode).toBe(500);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Connection failed');
    });

    it('should format FileStorageError correctly', () => {
      const error = new FileStorageError('Upload failed');
      const { response, statusCode } = formatErrorResponse(error);

      expect(statusCode).toBe(500);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Upload failed');
    });

    it('should format unexpected errors without exposing details', () => {
      const error = new Error('Internal server error with sensitive details');
      const { response, statusCode } = formatErrorResponse(error);

      expect(statusCode).toBe(500);
      expect(response.success).toBe(false);
      expect(response.error).toBe('An unexpected error occurred. Please try again.');
      expect(response.error).not.toContain('sensitive details');
    });
  });

  describe('Validation Error Utilities', () => {
    it('should create MultipleValidationErrors from error array', () => {
      // Requirement 1.6: Consistent validation error format
      const errors = [
        { field: 'firstName', message: 'First Name is required' },
        { field: 'email', message: 'Invalid email', code: 'INVALID_EMAIL' },
      ];
      const validationError = createValidationError(errors);

      expect(validationError).toBeInstanceOf(MultipleValidationErrors);
      expect(validationError.validationErrors).toEqual(errors);
      expect(validationError.statusCode).toBe(400);
    });

    it('should format validation errors consistently', () => {
      // Requirement 2.5: Include field names and specific error messages
      const errors = [
        { field: 'age', message: 'Age must be positive' },
        { field: 'birthday', message: 'Invalid date format', code: 'INVALID_DATE' },
      ];
      const formatted = formatValidationErrors(errors);

      expect(formatted.success).toBe(false);
      expect(formatted.errors).toHaveLength(2);
      expect(formatted.errors![0]).toEqual({
        field: 'age',
        message: 'Age must be positive',
        code: undefined,
      });
      expect(formatted.errors![1]).toEqual({
        field: 'birthday',
        message: 'Invalid date format',
        code: 'INVALID_DATE',
      });
    });
  });

  describe('Error Logging', () => {
    it('should log error with context', () => {
      const error = new ValidationError('email', 'Invalid email');
      const context = {
        userId: 'user123',
        path: '/api/enrollments',
        method: 'POST',
        requestData: { email: 'invalid' },
      };

      logError(error, context, LogLevel.ERROR);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

      expect(loggedData.level).toBe('ERROR');
      expect(loggedData.name).toBe('ValidationError');
      expect(loggedData.message).toBe('Invalid email');
      expect(loggedData.context.userId).toBe('user123');
      expect(loggedData.context.path).toBe('/api/enrollments');
      expect(loggedData.context.method).toBe('POST');
    });

    it('should exclude sensitive data from logs', () => {
      // Requirement: Exclude sensitive data from logs
      const error = new Error('Authentication failed');
      const context = {
        userId: 'user123',
        path: '/api/auth',
        method: 'POST',
        requestData: {
          email: 'user@example.com',
          password: 'secretPassword123',
          apiKey: 'secret-api-key',
          token: 'bearer-token',
        },
      };

      logError(error, context, LogLevel.ERROR);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

      // Sensitive fields should be redacted
      expect(loggedData.context.requestData.password).toBe('[REDACTED]');
      expect(loggedData.context.requestData.apiKey).toBe('[REDACTED]');
      expect(loggedData.context.requestData.token).toBe('[REDACTED]');
      
      // Non-sensitive fields should remain
      expect(loggedData.context.requestData.email).toBe('user@example.com');
    });

    it('should not include stack trace for validation errors', () => {
      const error = new ValidationError('email', 'Invalid email');
      
      logError(error, undefined, LogLevel.ERROR);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

      expect(loggedData.stack).toBeUndefined();
    });

    it('should include stack trace for unexpected errors', () => {
      const error = new Error('Unexpected error');
      
      logError(error, undefined, LogLevel.ERROR);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

      expect(loggedData.stack).toBeDefined();
      expect(loggedData.stack).toContain('Error: Unexpected error');
    });

    it('should log warnings with WARN level', () => {
      const error = new Error('Warning message');
      
      logError(error, undefined, LogLevel.WARN);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Validation Errors', () => {
    it('should include all invalid fields in response', () => {
      // Requirement 2.5: Validation errors include all invalid fields
      const errors = [
        { field: 'firstName', message: 'First Name is required' },
        { field: 'lastName', message: 'Last Name is required' },
        { field: 'middleName', message: 'Middle Name is required' },
        { field: 'email', message: 'Invalid email format' },
        { field: 'age', message: 'Age must be positive' },
      ];
      const error = new MultipleValidationErrors(errors);
      const { response } = formatErrorResponse(error);

      expect(response.errors).toHaveLength(5);
      expect(response.errors!.map(e => e.field)).toEqual([
        'firstName',
        'lastName',
        'middleName',
        'email',
        'age',
      ]);
    });

    it('should preserve error codes in validation errors', () => {
      const errors = [
        { field: 'email', message: 'Invalid email', code: 'INVALID_EMAIL' },
        { field: 'phone', message: 'Invalid phone', code: 'INVALID_PHONE' },
      ];
      const error = new MultipleValidationErrors(errors);
      const { response } = formatErrorResponse(error);

      expect(response.errors![0].code).toBe('INVALID_EMAIL');
      expect(response.errors![1].code).toBe('INVALID_PHONE');
    });
  });

  describe('Error Types', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError(
        ErrorType.VALIDATION,
        'Test error',
        400,
        'testField',
        'TEST_CODE'
      );

      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.field).toBe('testField');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('AppError');
    });

    it('should create ValidationError with correct defaults', () => {
      const error = new ValidationError('email', 'Invalid email');

      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.statusCode).toBe(400);
      expect(error.field).toBe('email');
      expect(error.name).toBe('ValidationError');
    });

    it('should create UnauthorizedError with correct defaults', () => {
      const error = new UnauthorizedError();

      expect(error.type).toBe(ErrorType.AUTHENTICATION);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create ForbiddenError with correct defaults', () => {
      const error = new ForbiddenError();

      expect(error.type).toBe(ErrorType.AUTHORIZATION);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
      expect(error.name).toBe('ForbiddenError');
    });

    it('should create NotFoundError with custom resource name', () => {
      const error = new NotFoundError('User');

      expect(error.type).toBe(ErrorType.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('Sensitive Data Sanitization', () => {
    it('should redact password fields', () => {
      const error = new Error('Test error');
      const context = {
        requestData: {
          username: 'testuser',
          password: 'secret123',
          confirmPassword: 'secret123',
        },
      };

      logError(error, context);

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.context.requestData.password).toBe('[REDACTED]');
      expect(loggedData.context.requestData.confirmPassword).toBe('[REDACTED]');
      expect(loggedData.context.requestData.username).toBe('testuser');
    });

    it('should redact token fields', () => {
      const error = new Error('Test error');
      const context = {
        requestData: {
          accessToken: 'token123',
          refreshToken: 'refresh456',
          apiToken: 'api789',
        },
      };

      logError(error, context);

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.context.requestData.accessToken).toBe('[REDACTED]');
      expect(loggedData.context.requestData.refreshToken).toBe('[REDACTED]');
      expect(loggedData.context.requestData.apiToken).toBe('[REDACTED]');
    });

    it('should redact authorization headers', () => {
      const error = new Error('Test error');
      const context = {
        requestData: {
          headers: {
            'content-type': 'application/json',
            authorization: 'Bearer secret-token',
          },
        },
      };

      logError(error, context);

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.context.requestData.headers.authorization).toBe('[REDACTED]');
      expect(loggedData.context.requestData.headers['content-type']).toBe('application/json');
    });

    it('should handle nested sensitive data', () => {
      const error = new Error('Test error');
      const context = {
        requestData: {
          user: {
            email: 'user@example.com',
            password: 'secret',
            profile: {
              name: 'Test User',
              apiKey: 'key123',
            },
          },
        },
      };

      logError(error, context);

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.context.requestData.user.password).toBe('[REDACTED]');
      expect(loggedData.context.requestData.user.profile.apiKey).toBe('[REDACTED]');
      expect(loggedData.context.requestData.user.email).toBe('user@example.com');
      expect(loggedData.context.requestData.user.profile.name).toBe('Test User');
    });
  });
});
