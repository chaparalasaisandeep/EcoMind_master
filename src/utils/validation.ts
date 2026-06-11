/**
 * EcoMind AI Ultra — Input Validation Utilities
 * OWASP-compliant input sanitization and validation.
 * Prevents XSS, injection attacks, and malformed data.
 */

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
];

const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
  /(--|\/\*|\*\/|;)/g,
];

/**
 * Sanitize string input to prevent XSS.
 * Escapes HTML entities and strips dangerous tags.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  let sanitized = input;

  // Strip dangerous HTML tags
  XSS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Escape remaining HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  // Trim and limit length
  return sanitized.trim().slice(0, 2000);
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate password strength.
 * Minimum 8 chars, at least one uppercase, one lowercase, one digit.
 */
export function isValidPassword(password: string): boolean {
  if (typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 128) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  return hasUpper && hasLower && hasDigit;
}

/**
 * Validate numeric range.
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}

/**
 * Validate date string (YYYY-MM-DD format).
 */
export function isValidDateString(dateStr: string): boolean {
  if (typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validate UUID format.
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize object values recursively.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }
  return sanitized;
}

/**
 * Check for prompt injection patterns in AI inputs.
 */
export function detectPromptInjection(input: string): boolean {
  const patterns = [
    /ignore previous instructions/gi,
    /disregard (all|previous) (instructions|rules)/gi,
    /you are now /gi,
    /system prompt/gi,
    /\[\s*system\s*\]/gi,
    /\{\s*system\s*\}/gi,
    /new instructions:/gi,
    /override/gi,
    /bypass/gi,
    /hack/gi,
  ];
  return patterns.some((p) => p.test(input));
}

/**
 * Rate limit check helper (client-side).
 * Tracks request timestamps in memory.
 */
export class RateLimiter {
  private requests: number[] = [];
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 30) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter((t) => now - t < this.windowMs);
    if (this.requests.length >= this.maxRequests) return false;
    this.requests.push(now);
    return true;
  }

  reset(): void {
    this.requests = [];
  }
}

// Global rate limiter for AI API calls
export const aiRateLimiter = new RateLimiter(60000, 10);
