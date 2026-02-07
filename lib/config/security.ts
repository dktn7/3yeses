/**
 * URL Validation Configuration
 * Centralized configuration for site-wide URL security rules
 */

export interface SecurityConfig {
  url: {
    validation: {
      enabled: boolean;
      strictMode: boolean;
      maxLength: number;
      allowedProtocols: string[];
      blockIpAddresses: boolean;
      blockLocalhost: boolean;
      blockedDomains: string[];
      blockedPatterns: string[];
      customRules?: Array<{
        name: string;
        pattern: RegExp;
        message: string;
      }>;
    };
    monitoring: {
      logBlocked: boolean;
      alertOnSuspicious: boolean;
    };
  };
  malware: {
    scanning: {
      enabled: boolean;
      engines: {
        fileHash: boolean;
        contentAnalysis: boolean;
        virusTotal: boolean;
        urlScan: boolean;
      };
      blockOnDetection: boolean;
      onlyBlockMalicious: boolean; // if true, allows suspicious but blocks malicious
      maxFileSizeBytes: number;
      knownMalwareHashes: string[];
    };
    monitoring: {
      logScans: boolean;
      alertOnThreat: boolean;
      storeQuarantined: boolean; // store files that failed scan
    };
  };
}

// Default configuration
const defaultConfig: SecurityConfig = {
  url: {
    validation: {
      enabled: true,
      strictMode: process.env.NODE_ENV === 'production',
      maxLength: 2048,
      allowedProtocols: ['https:', 'http:'],
      blockIpAddresses: true,
      blockLocalhost: true,
      blockedDomains: [
        // Adult content
        'pornhub.com',
        'xvideos.com',
        'xxx.com',
        'xhamster.com',
        'youporn.com',
        'redtube.com',
        'xnxx.com',
        
        // Malicious/suspicious
        'malware.com',
        'phishing.com',
      ],
      blockedPatterns: [
        'malware',
        'phishing',
        'hack',
        'exploit',
        'crack',
        'keygen',
        'warez',
      ],
    },
    monitoring: {
      logBlocked: true,
      alertOnSuspicious: process.env.NODE_ENV === 'production',
    },
  },
  malware: {
    scanning: {
      enabled: true,
      engines: {
        fileHash: true,
        contentAnalysis: true,
        virusTotal: !!process.env.VIRUSTOTAL_API_KEY,
        urlScan: !!process.env.URLSCAN_API_KEY,
      },
      blockOnDetection: true,
      onlyBlockMalicious: false, // block both suspicious and malicious
      maxFileSizeBytes: 500 * 1024 * 1024, // 500MB
      knownMalwareHashes: process.env.MALWARE_HASHES?.split(',') || [],
    },
    monitoring: {
      logScans: true,
      alertOnThreat: process.env.NODE_ENV === 'production',
      storeQuarantined: true,
    },
  },
};

// Allow environment-based overrides
const customBlockedDomains = process.env.BLOCKED_DOMAINS
  ? process.env.BLOCKED_DOMAINS.split(',').map((d) => d.trim())
  : [];

const customBlockedPatterns = process.env.BLOCKED_PATTERNS
  ? process.env.BLOCKED_PATTERNS.split(',').map((p) => p.trim())
  : [];

export const securityConfig: SecurityConfig = {
  ...defaultConfig,
  url: {
    ...defaultConfig.url,
    validation: {
      ...defaultConfig.url.validation,
      blockedDomains: [
        ...defaultConfig.url.validation.blockedDomains,
        ...customBlockedDomains,
      ],
      blockedPatterns: [
        ...defaultConfig.url.validation.blockedPatterns,
        ...customBlockedPatterns,
      ],
    },
  },
};

/**
 * Get URL validation config
 */
export function getUrlValidationConfig() {
  return securityConfig.url.validation;
}

/**
 * Update blocked domains at runtime (admin feature)
 */
export function updateBlockedDomains(domains: string[]): void {
  securityConfig.url.validation.blockedDomains.push(...domains);
}

/**
 * Check if a domain is blocked
 */
export function isDomainBlocked(domain: string): boolean {
  const lowerDomain = domain.toLowerCase();
  return securityConfig.url.validation.blockedDomains.some((blocked) =>
    lowerDomain.includes(blocked.toLowerCase())
  );
}

/**
 * Log blocked URL attempt
 */
export function logBlockedUrl(url: string, reason: string, userId?: string): void {
  if (!securityConfig.url.monitoring.logBlocked) return;

  console.warn('[URL Security]', {
    timestamp: new Date().toISOString(),
    url,
    reason,
    userId,
  });

  // TODO: Send to monitoring service (e.g., Sentry, DataDog)
  // if (securityConfig.url.monitoring.alertOnSuspicious) {
  //   sendSecurityAlert({ url, reason, userId });
  // }
}
