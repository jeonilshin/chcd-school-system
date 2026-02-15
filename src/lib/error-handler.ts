/**
 * Global Error Handler
 * 
 * Provides centralized error handling, logging, and response formatting
 * for the student enrollment system.
 * 
 * Requirements: All requirements benefit from proper error handling
 */

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

/**
 * Error types for classification
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE = 'DATABASE',
  FILE_STORAGE = 'FILE_STORAGE',
  INTERNAL = 'INTERNAL',
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public statusCode: number,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  constructor(
    public field: string,
    public message: string,
    public code?: string
  ) {
    super(ErrorType.VALIDATION, message, 400, field, code);
    this.name = 'ValidationError';
  }
}

/**
 * Multiple validation errors class
 * Used when multiple fields have validation errors
 */
export class MultipleValidationErrors extends AppError {
  constructor(
    public validationErrors: Array<{
      field: string;
      message: string;
      code?: string;
    }>
  ) {
    super(
      ErrorType.VALIDATION,
      'Validation failed for one or more fields',
      400
    );
    this.name = 'MultipleValidationErrors';
  }
}

/**
 * Authentication error class
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(ErrorType.AUTHENTICATION, message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Authorization error class
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(ErrorType.AUTHORIZATION, message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(ErrorType.NOT_FOUND, `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Database error class
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(ErrorType.DATABASE, message, 500);
    this.name = 'DatabaseError';
  }
}

/**
 * File storage error class
 */
export class FileStorageError extends AppError {
  constructor(message: string = 'File storage operation failed') {
    super(ErrorType.FILE_STORAGE, message, 500);
    this.name = 'FileStorageError';
  }
}

/**
 * Sensitive data patterns to exclude from logs
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /authorization/i,
  /cookie/i,
];

/**
 * Check if a field name contains sensitive data
 */
function isSensitiveField(fieldName: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(fieldName));
}

/**
 * Sanitize error data by removing sensitive information
 */
function sanitizeErrorData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized: any = Array.isArray(data) ? [] : {};

  for (const key in data) {
    if (isSensitiveField(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      sanitized[key] = sanitizeErrorData(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  }

  return sanitized;
}

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

/**
 * Log error with appropriate detail level
 * Excludes sensitive data from logs
 */
export function logError(
  error: Error | AppError,
  context?: {
    userId?: string;
    path?: string;
    method?: string;
    requestData?: any;
  },
  level: LogLevel = LogLevel.ERROR
): void {
  const timestamp = new Date().toISOString();
  const logData: any = {
    timestamp,
    level,
    name: error.name,
    message: error.message,
  };

  // Add context if provided
  if (context) {
    logData.context = {
      userId: context.userId,
      path: context.path,
      method: context.method,
      // Sanitize request data to remove sensitive information
      requestData: context.requestData
        ? sanitizeErrorData(context.requestData)
        : undefined,
    };
  }

  // Add error type and status code for AppError
  if (error instanceof AppError) {
    logData.type = error.type;
    logData.statusCode = error.statusCode;
    logData.field = error.field;
    logData.code = error.code;
  }

  // Add stack trace for internal errors
  if (
    error instanceof AppError &&
    error.type === ErrorType.INTERNAL
  ) {
    logData.stack = error.stack;
  } else if (!(error instanceof AppError)) {
    // Log stack trace for unexpected errors
    logData.stack = error.stack;
  }

  // Output log based on level
  switch (level) {
    case LogLevel.ERROR:
      console.error(JSON.stringify(logData, null, 2));
      break;
    case LogLevel.WARN:
      console.warn(JSON.stringify(logData, null, 2));
      break;
    case LogLevel.INFO:
      console.info(JSON.stringify(logData, null, 2));
      break;
    case LogLevel.DEBUG:
      console.debug(JSON.stringify(logData, null, 2));
      break;
  }
}

/**
 * Handle Prisma database errors
 */
function handlePrismaError(error: any): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        return new DatabaseError('A record with this value already exists');
      case 'P2025':
        // Record not found
        return new NotFoundError('Record');
      case 'P2003':
        // Foreign key constraint violation
        return new DatabaseError('Related record not found');
      case 'P2014':
        // Invalid ID
        return new ValidationError('id', 'Invalid ID format');
      default:
        return new DatabaseError('Database operation failed');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('database', 'Invalid data format');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new DatabaseError('Database connection failed');
  }

  return new DatabaseError('Database operation failed');
}

/**
 * Format error response for API
 */
export function formatErrorResponse(
  error: Error | AppError,
  context?: {
    userId?: string;
    path?: string;
    method?: string;
    requestData?: any;
  }
): { response: ErrorResponse; statusCode: number } {
  // Log the error
  logError(error, context);

  // Handle MultipleValidationErrors
  if (error instanceof MultipleValidationErrors) {
    return {
      response: {
        success: false,
        errors: error.validationErrors,
      },
      statusCode: error.statusCode,
    };
  }

  // Handle known AppError types
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
    };

    if (error.field) {
      // Validation error with field
      response.errors = [
        {
          field: error.field,
          message: error.message,
          code: error.code,
        },
      ];
    } else {
      // General error
      response.error = error.message;
    }

    return {
      response,
      statusCode: error.statusCode,
    };
  }

  // Handle Prisma errors
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError ||
    error instanceof Prisma.PrismaClientInitializationError
  ) {
    const appError = handlePrismaError(error);
    return formatErrorResponse(appError, context);
  }

  // Handle unexpected errors
  // Don't expose internal error details to client
  return {
    response: {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    },
    statusCode: 500,
  };
}

/**
 * Create error response with proper formatting and logging
 */
export function createErrorResponse(
  error: Error | AppError,
  context?: {
    userId?: string;
    path?: string;
    method?: string;
    requestData?: any;
  }
): NextResponse<ErrorResponse> {
  const { response, statusCode } = formatErrorResponse(error, context);
  return NextResponse.json(response, { status: statusCode });
}

/**
 * Handle API route errors with consistent formatting
 */
export function handleApiError(
  error: any,
  context?: {
    userId?: string;
    path?: string;
    method?: string;
    requestData?: any;
  }
): NextResponse<ErrorResponse> {
  return createErrorResponse(error, context);
}

/**
 * Convert validation errors from EnrollmentValidator to MultipleValidationErrors
 * Requirements: 1.6, 2.5, 3.5
 */
export function createValidationError(
  errors: Array<{ field: string; message: string; code?: string }>
): MultipleValidationErrors {
  return new MultipleValidationErrors(errors);
}

/**
 * Format validation errors for consistent API response
 * Requirements: 1.6, 2.5, 3.5
 */
export function formatValidationErrors(
  errors: Array<{ field: string; message: string; code?: string }>
): ErrorResponse {
  return {
    success: false,
    errors: errors.map((error) => ({
      field: error.field,
      message: error.message,
      code: error.code,
    })),
  };
}
