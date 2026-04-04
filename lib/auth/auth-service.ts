// Authentication service for 3YESES platform
// Implements secure authentication with JWT, bcrypt, and rate limiting

import * as bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { AuditLog } from '../database/schemas.ts';

// Configuration constants
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('Missing JWT_SECRET or JWT_REFRESH_SECRET environment variables. Set them before starting the server.');
}

// Encode secrets for jose
const ENCODED_JWT_SECRET = new TextEncoder().encode(JWT_SECRET);
const ENCODED_JWT_REFRESH_SECRET = new TextEncoder().encode(JWT_REFRESH_SECRET);
const ACCESS_TOKEN_EXPIRY = '24h'; // Activity-based sliding window
const REFRESH_TOKEN_EXPIRY = '7d'; // Long-term refresh token
const PASSWORD_SALT_ROUNDS = 12; // Strong password hashing
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * AuthService class providing secure authentication functionality
 */
class AuthService {
  
  /**
   * Hash a password using bcrypt with salt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(PASSWORD_SALT_ROUNDS);
      return await bcrypt.hash(password, salt);
    } catch (error: any) {
      console.error('Password hashing error:', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Generate JWT access token
   */
  static async generateJWT(payload: { userId: string; email: string; role: string; name: string }): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('3yeses-platform')
      .setAudience('3yeses-users')
      .setExpirationTime(ACCESS_TOKEN_EXPIRY)
      .sign(ENCODED_JWT_SECRET);
  }

  /**
   * Generate JWT refresh token
   */
  static async generateRefreshToken(payload: { userId: string }): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('3yeses-platform')
      .setAudience('3yeses-users')
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .sign(ENCODED_JWT_REFRESH_SECRET);
  }

  /**
   * Verify JWT access token
   */
  static async verifyJWT(token: string): Promise<{ userId: string; email: string; role: string; name: string } | null> {
    // verifyJWT: do not log sensitive payloads in production
    try {
      const { payload } = await jwtVerify(token, ENCODED_JWT_SECRET, {
        issuer: '3yeses-platform',
        audience: '3yeses-users'
      });
      return payload as unknown as { userId: string; email: string; role: string; name: string };
    } catch (error) {
      console.error('[AuthService] JWT verification error:', (error as Error).message);
      return null;
    }
  }

  /**
   * Verify JWT refresh token
   */
  static async verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
    try {
      const { payload } = await jwtVerify(token, ENCODED_JWT_REFRESH_SECRET, {
        issuer: '3yeses-platform',
        audience: '3yeses-users'
      });
      return payload as unknown as { userId: string };
    } catch (error: any) {
      console.error('Refresh token verification error:', error.message);
      return null;
    }
  }

  /**
   * Generate secure random token for email verification, password reset, etc.
   */
  static generateSecureToken(): string {
    // Use Web Crypto API which is supported in both Edge and modern Node.js
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
      const buf = new Uint8Array(32);
      globalThis.crypto.getRandomValues(buf);
      return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback for environments without crypto.getRandomValues (extremely unlikely in modern Next.js)
    console.warn('[AuthService] Web Crypto not available, using Math.random fallback');
    const fallback = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
    return fallback.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password contains common words and is not secure');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if user should be locked out due to failed attempts
   */
  static shouldLockAccount(attempts: number): boolean {
    return attempts >= MAX_LOGIN_ATTEMPTS;
  }

  /**
   * Calculate lockout end time
   */
  static calculateLockoutTime(): Date {
    return new Date(Date.now() + LOCKOUT_DURATION);
  }

  /**
   * Rate limiting check (simple in-memory implementation)
   * In production, use Redis or database-backed rate limiting
   */
  private static readonly rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  static async checkRateLimit(key: string, maxAttempts: number = 10, windowMs: number = 60000): Promise<boolean> {
    const now = Date.now();
    const record = this.rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false; // Rate limit exceeded
    }

    record.count++;
    return true;
  }

  /**
   * Create audit log entry
   * In production, this would save to database
   */
  static async createAuditLog(
    action: string,
    resource: string,
    details: Record<string, unknown>,
    userId?: string,
    ipAddress?: string,
    success: boolean = true
  ): Promise<void> {
    const logEntry: Omit<AuditLog, 'id' | 'timestamp'> = {
      action,
      resource,
      userId: userId,
      details,
      ipAddress: ipAddress || 'unknown',
      userAgent: undefined, // Would be passed from request
      success
    };

    // In production, save to database
    console.log('Audit Log:', logEntry);
  }

  /**
   * Generate session token
   */
  static generateSessionToken(): string {
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
      const buf = new Uint8Array(64);
      globalThis.crypto.getRandomValues(buf);
      return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    console.warn('[AuthService] Web Crypto not available for session token, using Math.random fallback');
    const fallback = Array.from({ length: 64 }, () => Math.floor(Math.random() * 256));
    return fallback.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate session token format
   */
  static validateSessionToken(token: string): boolean {
    return /^[a-f0-9]{128}$/.test(token);
  }

  /**
   * Extract user agent information for logging
   */
  static parseUserAgent(userAgent: string): {
    browser: string;
    os: string;
    device: string;
  } {
    // Simple user agent parsing - in production use a proper library
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      browser = 'Safari';
    }
    
    let os = 'Unknown';
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    }
    
    const device = userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';

    return { browser, os, device };
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  /**
   * Generate secure reset token with expiry
   */
  static generateResetToken(): { token: string; expires: Date } {
    return {
      token: this.generateSecureToken(),
      expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    };
  }

  /**
   * Check if token has expired
   */
  static isTokenExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }
}

// Provide both named and default export for maximum interop (Next.js + TS + any CJS transpiled remnants)
export { AuthService };
export default AuthService;
