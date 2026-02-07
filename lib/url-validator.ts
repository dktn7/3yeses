/**
 * URL Validation Utility
 * Provides site-wide URL validation against malicious and blocked domains
 */

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedUrl?: string;
}

export interface UrlValidatorConfig {
  blockedDomains?: string[];
  blockedPatterns?: RegExp[];
  allowedProtocols?: string[];
  maxLength?: number;
}

// Default blocked domains (adult content, malicious sites)
const DEFAULT_BLOCKED_DOMAINS = [
  // Adult content
  'pornhub.com', 'xvideos.com', 'xxx.com', 'xhamster.com', 'youporn.com',
  'redtube.com', 'xnxx.com', 'tube8.com', 'porn.com', 'spankbang.com',
  
  // Known malicious patterns (can be extended with threat intelligence feeds)
  'malware', 'phishing', 'hack', 'exploit', 'trojan',
  
  // Suspicious TLDs
  '.tk', '.ml', '.ga', '.cf', '.gq', // Free domains often used for phishing
];

// Default malicious patterns
const DEFAULT_BLOCKED_PATTERNS = [
  /free[-_]?download/i,
  /crack(ed)?/i,
  /keygen/i,
  /warez/i,
  /torrent/i,
];

const DEFAULT_CONFIG: Required<UrlValidatorConfig> = {
  blockedDomains: DEFAULT_BLOCKED_DOMAINS,
  blockedPatterns: DEFAULT_BLOCKED_PATTERNS,
  allowedProtocols: ['http:', 'https:'],
  maxLength: 2048,
};

export class UrlValidator {
  private config: Required<UrlValidatorConfig>;

  constructor(config?: UrlValidatorConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      blockedDomains: [
        ...DEFAULT_CONFIG.blockedDomains,
        ...(config?.blockedDomains || []),
      ],
      blockedPatterns: [
        ...DEFAULT_CONFIG.blockedPatterns,
        ...(config?.blockedPatterns || []),
      ],
    };
  }

  /**
   * Validates a URL against security rules
   */
  validate(url: string): UrlValidationResult {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' };
    }

    const trimmedUrl = url.trim();

    // Check length
    if (trimmedUrl.length > this.config.maxLength) {
      return { isValid: false, error: 'URL is too long' };
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmedUrl);
    } catch (e) {
      return { isValid: false, error: 'Invalid URL format' };
    }

    // Check protocol
    if (!this.config.allowedProtocols.includes(parsedUrl.protocol)) {
      return {
        isValid: false,
        error: `Protocol ${parsedUrl.protocol} is not allowed. Use HTTPS.`,
      };
    }

    // Check for blocked domains
    const hostname = parsedUrl.hostname.toLowerCase();
    const fullUrl = trimmedUrl.toLowerCase();

    for (const domain of this.config.blockedDomains) {
      if (hostname.includes(domain.toLowerCase()) || fullUrl.includes(domain.toLowerCase())) {
        return {
          isValid: false,
          error: 'This domain is blocked for security reasons',
        };
      }
    }

    // Check for malicious patterns
    for (const pattern of this.config.blockedPatterns) {
      if (pattern.test(fullUrl)) {
        return {
          isValid: false,
          error: 'URL contains suspicious content',
        };
      }
    }

    // Check for IP addresses (potential security risk)
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      return {
        isValid: false,
        error: 'Direct IP addresses are not allowed',
      };
    }

    // Check for localhost/internal networks
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ) {
      return {
        isValid: false,
        error: 'Local/internal URLs are not allowed',
      };
    }

    return {
      isValid: true,
      sanitizedUrl: trimmedUrl,
    };
  }

  /**
   * Validates multiple URLs
   */
  validateBatch(urls: string[]): Map<string, UrlValidationResult> {
    const results = new Map<string, UrlValidationResult>();
    for (const url of urls) {
      results.set(url, this.validate(url));
    }
    return results;
  }

  /**
   * Adds custom blocked domains at runtime
   */
  addBlockedDomains(domains: string[]): void {
    this.config.blockedDomains.push(...domains);
  }

  /**
   * Adds custom blocked patterns at runtime
   */
  addBlockedPatterns(patterns: RegExp[]): void {
    this.config.blockedPatterns.push(...patterns);
  }
}

// Export singleton instance for convenience
export const urlValidator = new UrlValidator();

/**
 * Quick validation function for common use cases
 */
export function validateUrl(url: string, config?: UrlValidatorConfig): UrlValidationResult {
  const validator = config ? new UrlValidator(config) : urlValidator;
  return validator.validate(url);
}

/**
 * Returns true if URL is safe, false otherwise
 */
export function isUrlSafe(url: string): boolean {
  return urlValidator.validate(url).isValid;
}
