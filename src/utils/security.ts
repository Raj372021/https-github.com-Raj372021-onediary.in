// Anti-Spam & Security Utility for OneDiary

const rateLimitMap = new Map<string, { count: number; firstAttempt: number }>();

/**
 * Anti-Spam Rate Limiter
 * Returns true if allowed, false if spam rate limit exceeded.
 */
export function checkRateLimit(actionKey: string, maxAttempts = 10, windowMs = 10000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(actionKey);

  if (!record) {
    rateLimitMap.set(actionKey, { count: 1, firstAttempt: now });
    return true;
  }

  if (now - record.firstAttempt > windowMs) {
    // Reset window
    rateLimitMap.set(actionKey, { count: 1, firstAttempt: now });
    return true;
  }

  if (record.count >= maxAttempts) {
    console.warn(`[SECURITY] Spam rate limit exceeded for action: ${actionKey}`);
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Input Sanitizer to prevent XSS and malicious HTML/Script injection
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  
  // Truncate overly long strings
  let sanitized = input.slice(0, maxLength);
  
  // Remove script tags and HTML tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]+>/g, '');
  
  return sanitized.trim();
}

/**
 * Validates text against spam patterns (e.g. repeated URL spams)
 */
export function isSpamContent(text: string): boolean {
  if (!text) return false;
  // Check for suspicious URL spam repetitions
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount > 3) return true;
  return false;
}
