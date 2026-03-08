/**
 * Security and validation utilities for CodeCollab
 */

// Allowed characters for file names
const VALID_FILENAME_REGEX = /^[a-zA-Z0-9._-]+$/;
// Maximum file name length
const MAX_FILENAME_LENGTH = 255;
// Reserved file names (Windows)
const RESERVED_NAMES = [
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
];

/**
 * Validates a file name for security
 * @param filename The file name to validate
 * @returns True if valid, false otherwise
 */
export function validateFileName(filename: string): boolean {
  // Check length
  if (!filename || filename.length === 0 || filename.length > MAX_FILENAME_LENGTH) {
    return false;
  }

  // Check for invalid characters
  if (!VALID_FILENAME_REGEX.test(filename)) {
    return false;
  }

  // Check for reserved names (case insensitive)
  const nameWithoutExt = filename.split('.')[0].toUpperCase();
  if (RESERVED_NAMES.includes(nameWithoutExt)) {
    return false;
  }

  // Check for path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }

  // Check for leading/trailing dots and spaces
  if (filename.startsWith('.') || filename.startsWith(' ') || 
      filename.endsWith('.') || filename.endsWith(' ')) {
    return false;
  }

  return true;
}

/**
 * Sanitizes a file name by removing invalid characters
 * @param filename The file name to sanitize
 * @returns A sanitized file name
 */
export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/^\./, '_') // Replace leading dot
    .replace(/^ /, '_') // Replace leading space
    .slice(0, MAX_FILENAME_LENGTH); // Limit length
}

/**
 * Validates session ID format
 * @param sessionId The session ID to validate
 * @returns True if valid, false otherwise
 */
export function validateSessionId(sessionId: string): boolean {
  // Session IDs should be UUIDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}

/**
 * Validates user name for security
 * @param name The user name to validate
 * @returns True if valid, false otherwise
 */
export function validateUserName(name: string): boolean {
  // Check length
  if (!name || name.length === 0 || name.length > 50) {
    return false;
  }

  // Check for script injection attempts
  if (/<script|javascript:|on\w+=/i.test(name)) {
    return false;
  }

  // Allow letters, numbers, spaces, and basic punctuation
  const validNameRegex = /^[a-zA-Z0-9\s._-]+$/;
  return validNameRegex.test(name.trim());
}

/**
 * Validates code content for basic security
 * @param code The code to validate
 * @param language The programming language
 * @returns True if potentially safe, false if clearly dangerous
 */
export function validateCodeContent(code: string, language: string): boolean {
  if (!code || code.length === 0) {
    return true; // Empty code is safe
  }

  // Check for extremely long code (DoS prevention)
  if (code.length > 100000) { // 100KB limit
    return false;
  }

  // Language-specific security checks
  switch (language) {
    case 'javascript':
      // Block obvious dangerous patterns
      const dangerousPatterns = [
        /eval\s*\(/,
        /Function\s*\(/,
        /setTimeout\s*\(/,
        /setInterval\s*\(/,
        /document\./,
        /window\./,
        /fetch\s*\(/,
        /XMLHttpRequest/,
        /WebSocket/,
        /import\s+.*\s+from/,
        /require\s*\(/,
      ];
      
      return !dangerousPatterns.some(pattern => pattern.test(code));

    case 'html':
      // Block script tags and dangerous attributes
      const dangerousHTML = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
      ];
      
      return !dangerousHTML.some(pattern => pattern.test(code));

    default:
      return true; // Other languages are currently simulated
  }
}

/**
 * Error messages for validation failures
 */
export const VALIDATION_ERRORS = {
  INVALID_FILENAME: 'Invalid file name. Use only letters, numbers, dots, hyphens, and underscores.',
  RESERVED_FILENAME: 'File name is reserved by the system.',
  PATH_TRAVERSAL: 'File name contains invalid path characters.',
  INVALID_SESSION_ID: 'Invalid session ID format.',
  INVALID_USERNAME: 'Invalid user name. Use only letters, numbers, spaces, dots, hyphens, and underscores.',
  CODE_TOO_LARGE: 'Code is too large. Maximum size is 100KB.',
  DANGEROUS_CODE: 'Code contains potentially dangerous content.',
} as const;
