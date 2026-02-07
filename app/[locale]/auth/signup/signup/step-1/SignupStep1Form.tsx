"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle, Phone, X } from 'lucide-react';
import { DynamicProgressTracker } from '@/components/DynamicProgressTracker';

export default function SignupStep1Form({ initialRole = 'talent' }: { initialRole?: 'talent' }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: initialRole,
    agreeToTerms: false,
    agreeToPrivacy: false,
    confirmAge: false,
    agreeToMarketing: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = [
      { regex: /.{8,}/, points: 25, label: '8+ characters' },
      { regex: /[a-z]/, points: 15, label: 'Lowercase letter' },
      { regex: /[A-Z]/, points: 15, label: 'Uppercase letter' },
      { regex: /\d/, points: 15, label: 'Number' },
      { regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, points: 20, label: 'Special character' },
      { regex: /.{12,}/, points: 10, label: '12+ characters (bonus)' }
    ];
    const passed = checks.map(check => ({ ...check, passed: check.regex.test(password) }));
    score = passed.reduce((total, check) => total + (check.passed ? check.points : 0), 0);
    if (/(.)\1{2,}/.test(password)) score -= 20;
    if (/123|abc|password|qwerty/i.test(password)) score -= 30;
    return { score: Math.max(0, Math.min(100, score)), checks: passed, level: getPasswordLevel(score) };
  };

  const getPasswordLevel = (score: number): string => {
    if (score < 40) return 'weak';
    if (score < 70) return 'medium';
    if (score < 90) return 'strong';
    return 'excellent';
  };

  const getStrengthColor = (level: string): string => {
    switch (level) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (formData.phoneNumber.trim() && !/^\+?[1-9]\d{1,15}$/.test(formData.phoneNumber.replace(/[\s\-()]/g, ''))) newErrors.phoneNumber = 'Please enter a valid phone number';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (getPasswordStrength(formData.password).score < 40) newErrors.password = 'Password is too weak.';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the Terms of Service';
    if (!formData.agreeToPrivacy) newErrors.agreeToPrivacy = 'You must agree to the Privacy Policy';
    if (!formData.confirmAge) newErrors.confirmAge = 'You must confirm you are 18 years or older';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors({ general: result.message || 'An error occurred during registration.' });
        return;
      }

      // Optionally, store some non-sensitive info if needed for the next step
      localStorage.setItem('signup_progress', JSON.stringify({ step: 1, userId: result.userId, role: formData.role }));
      
  router.push('/auth/signup/step-2');

    } catch (error) {
      console.error('Signup step 1 error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 mx-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Join 3YESES</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create your account and start connecting</p>
      </div>
      <DynamicProgressTracker currentStep={1} totalSteps={3} stepLabels={["Account", "Profile", "Upload"]} />
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 text-red-700 dark:text-red-300 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {errors.general}
        </div>
      )}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <User className="h-12 w-12 mb-2 text-blue-600" />
            <span className="text-lg font-bold text-blue-900 dark:text-blue-300">Talent Sign Up</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Actor, Singer, Performer, etc.</span>
          </div>
        </div>
        {/* Only talent sign up allowed, no client option */}
        {/* ...existing code... */}
      </form>
      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* ...existing code... */}
        </div>
      )}
      {/* Privacy Policy Modal */}
      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowTermsModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    Terms of Service
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowTermsModal(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">1. Acceptance of Terms</h4>
                    <p>By accessing and using 3YESES, you accept and agree to be bound by the terms and provision of this agreement.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">2. Use License</h4>
                    <p>Permission is granted to temporarily download one copy of the materials on 3YESES for personal, non-commercial transitory viewing only.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">3. User Accounts</h4>
                    <p>When creating an account, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">4. Talent and Client Responsibilities</h4>
                    <p>Talents must provide accurate information about their skills and experience. Clients must provide honest feedback and timely payment for services rendered.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">5. Prohibited Uses</h4>
                    <p>You may not use our service for any unlawful purpose, to harass other users, or to transmit any harmful or inappropriate content.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">6. Termination</h4>
                    <p>We may terminate or suspend your account at any time for violations of these terms or for any other reason at our discretion.</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowTermsModal(false)}
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowPrivacyModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    Privacy Policy
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPrivacyModal(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Information We Collect</h4>
                    <p>We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How We Use Your Information</h4>
                    <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Information Sharing</h4>
                    <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Security</h4>
                    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cookies</h4>
                    <p>We use cookies and similar technologies to enhance your experience, analyze usage patterns, and personalize content.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Rights</h4>
                    <p>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowPrivacyModal(false)}
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

