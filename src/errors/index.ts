/**
 * EcoMind AI Ultra — Custom Error Classes
 * Typed error hierarchy for structured error handling.
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, { field });
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Not authenticated') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, 'AUTHZ_ERROR', 403);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, statusCode?: number) {
    super(message, 'NETWORK_ERROR', statusCode ?? 503);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalCode?: string) {
    super(message, 'DATABASE_ERROR', 500, { originalCode });
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AiSecurityError extends AppError {
  constructor(message: string = 'Potentially harmful input detected') {
    super(message, 'AI_SECURITY_ERROR', 400);
    this.name = 'AiSecurityError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function fromSupabaseError(error: { message: string; code?: string }): DatabaseError {
  return new DatabaseError(error.message, error.code);
}

export function fromFetchError(error: unknown): NetworkError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Network request failed');
  }
  return new NetworkError(error instanceof Error ? error.message : 'Unknown network error');
}

export function isErrorType<T extends AppError>(error: unknown, ErrorClass: new (...args: never[]) => T): error is T {
  return error instanceof ErrorClass;
}
