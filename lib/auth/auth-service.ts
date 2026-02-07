// Authentication service for 3YESES platform
// Implements secure authentication with JWT, bcrypt, and rate limiting

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import type { AuditLog } from '../database/schemas.ts';

// Configuration constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
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
  static generateJWT(payload: { userId: string; email: string; role: string; name: string }): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: '3yeses-platform',
      audience: '3yeses-users'
    });
  }

  /**
   * Generate JWT refresh token
   */
  static generateRefreshToken(payload: { userId: string }): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { 
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: '3yeses-platform',
      audience: '3yeses-users'
    });
  }

  /**
   * Verify JWT access token
   */
  static verifyJWT(token: string): { userId: string; email: string; role: string; name: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: '3yeses-platform',
        audience: '3yeses-users'
      }) as { userId: string; email: string; role: string; name: string };
      return decoded;
    } catch (error) {
      console.error('JWT verification error:', (error as Error).message);
      return null;
    }
  }

  /**
   * Verify JWT refresh token
   */
  static verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: '3yeses-platform',
        audience: '3yeses-users'
      }) as { userId: string };
      return decoded;
    } catch (error: any) {
      console.error('Refresh token verification error:', error.message);
      return null;
    }
  }

  /**
   * Generate secure random token for email verification, password reset, etc.
   */
  static generateSecureToken(): string {
    return randomBytes(32).toString('hex');
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
    return randomBytes(64).toString('hex');
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
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
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
