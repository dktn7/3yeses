// Database schema definitions for 3YESES platform
// This file defines the structure for user management and authentication

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Never store plain passwords
  role: 'talent' | 'recruiter' | 'admin';
  emailVerified: boolean;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  
  // Profile fields
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  
  // Role-specific data
  talentProfile?: TalentProfile;
  recruiterProfile?: RecruiterProfile;
  
  // Security & compliance
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lockoutUntil?: Date;
  gdprConsent: boolean;
  privacyPolicyAccepted: boolean;
  termsAccepted: boolean;
}

export interface TalentProfile {
  userId: string;
  displayName: string;
  bio?: string;
  skills: string[];
  experience: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  location?: string;
  age?: number;
  height?: string;
  portfolio: PortfolioItem[];
  demoReel?: string;
  resume?: string;
  availability: 'available' | 'busy' | 'unavailable';
  rateRange?: {
    min: number;
    max: number;
    currency: string;
  };
  visibility: 'public' | 'private' | 'recruiter-only';
}

export interface RecruiterProfile {
  userId: string;
  companyName: string;
  companyWebsite?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  industryType: string[];
  location?: string;
  description?: string;
}

export interface PortfolioItem {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  title?: string;
  description?: string;
  uploadedAt: Date;
}

// Authentication tokens and sessions
export interface AuthToken {
  id: string;
  userId: string;
  token: string;
  type: 'access' | 'refresh' | 'email-verification' | 'password-reset';
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  deviceInfo?: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
  active: boolean;
}

// Audit logging for security
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
}
