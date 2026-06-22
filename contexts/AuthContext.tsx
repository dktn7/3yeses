'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'talent' | 'client' | 'admin';
  profileComplete: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (userData: SignupData) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => void;
}

export interface SignupData {
  // Step 1: Account
  name: string;
  email: string;
  password: string;
  role: 'talent' | 'client';
  
  // Step 2: Profile (for talents)
  professionalRole?: string;
  bio?: string;
  location?: string;
  experienceLevel?: number;
  skills?: string[];
  languages?: string[];
  
  // Step 3: Media (for talents)
  avatarUrl?: string;
  videoUrl?: string;
  portfolio?: Array<{
    title: string;
    url: string;
    type: 'video' | 'image' | 'audio';
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session using our verify endpoint
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            const backendRole: string | undefined = data.user.role;
            const normalizedRole: User['role'] =
              backendRole === 'talent' || backendRole === 'TALENT'
                ? 'talent'
                : backendRole === 'admin' || backendRole === 'ADMIN'
                  ? 'admin'
                  : 'client';

            const userData: User = {
              id: data.user.id,
              name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.email,
              email: data.user.email,
              role: normalizedRole,
              profileComplete: data.user.profileComplete || false,
              avatarUrl: data.user.avatarUrl || undefined,
            };
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        const backendRole: string | undefined = data.user.role;
        const normalizedRole: User['role'] =
          backendRole === 'talent' || backendRole === 'TALENT'
            ? 'talent'
            : backendRole === 'admin' || backendRole === 'ADMIN'
              ? 'admin'
              : 'client';

        const userData: User = {
          id: data.user.id,
          name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.email,
          email: data.user.email,
          role: normalizedRole,
          profileComplete: data.user.profileComplete || false,
        };

        setUser(userData);
        // Remove localStorage usage since we're using HTTP-only cookies
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.password,
          role: userData.role,
          firstName: userData.name.split(' ')[0] || userData.name,
          lastName: userData.name.split(' ').slice(1).join(' ') || '',
          gdprConsent: true,
          termsAccepted: true,
          privacyPolicyAccepted: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Don't auto-login after registration - user needs to verify email
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.errors ? data.errors.join(', ') : (data.message || 'Registration failed')
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Clear any signup progress
      localStorage.removeItem('signup_progress');
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(currentUser => {
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        // In production, sync this with backend
        return updatedUser;
      }
      return currentUser;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    signup,
    updateUser
  }), [user, loading, login, logout, signup, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
