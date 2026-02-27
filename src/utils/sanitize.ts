// Input sanitization utilities
// These strip dangerous characters before data reaches the API or storage.

/** Strip HTML tags and trim whitespace */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')    // strip HTML tags
    .replace(/[<>"'&]/g, '')    // strip remaining dangerous chars
    .trim();
}

/** Normalize and lowercase email, strip anything unexpected */
export function sanitizeEmail(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.@+_-]/g, '');  // only valid email chars
}

/** Validate that a string looks like a safe ID (alphanumeric + hyphens) */
export function isSafeId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

/** Validate a URL string is HTTPS */
export function isSecureUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
