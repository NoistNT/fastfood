import DOMPurify from 'isomorphic-dompurify';

// Basic HTML sanitization - removes potentially dangerous HTML
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

// Sanitize SQL-like inputs (basic protection against SQL injection patterns)
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .trim();
}

// Sanitize file names (remove dangerous characters)
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Remove dangerous characters
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .substring(0, 255) // Limit length
    .trim();
}

// Sanitize general text input (remove control characters and excessive whitespace)
export function sanitizeText(input: string): string {
  // Remove control characters by filtering them out
  const cleaned = input
    .split('')
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127; // Keep printable characters, exclude DEL
    })
    .join('');
  return cleaned.replace(/\s+/g, ' ').trim();
}

// Sanitize email (basic validation and normalization)
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().replace(/\s+/g, ''); // Remove any whitespace
}

// Sanitize URL (basic validation)
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    // If URL parsing fails, return empty string
    return '';
  }
}

// Sanitize phone number (remove all non-digit characters except +)
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').substring(0, 20);
}

// General input sanitization based on type
export function sanitizeInput(
  input: string,
  type: 'text' | 'email' | 'url' | 'phone' | 'filename' | 'html' = 'text'
): string {
  if (!input || typeof input !== 'string') return '';

  switch (type) {
    case 'email':
      return sanitizeEmail(input);
    case 'url':
      return sanitizeUrl(input);
    case 'phone':
      return sanitizePhone(input);
    case 'filename':
      return sanitizeFilename(input);
    case 'html':
      return sanitizeHtml(input);
    case 'text':
    default:
      return sanitizeText(input);
  }
}
