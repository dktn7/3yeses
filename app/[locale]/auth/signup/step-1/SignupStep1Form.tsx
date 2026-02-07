"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle, Phone, X } from 'lucide-react';
import { DynamicProgressTracker } from '@/components/DynamicProgressTracker';

export default function SignupStep1Form({ initialRole = 'talent' }: { initialRole?: 'talent' }) {
  const t = useTranslations('SignupStep1Form');
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
      { regex: /.{8,}/, points: 25, label: t('passwordStrength.8Chars') },
      { regex: /[a-z]/, points: 15, label: t('passwordStrength.lowercase') },
      { regex: /[A-Z]/, points: 15, label: t('passwordStrength.uppercase') },
      { regex: /\d/, points: 15, label: t('passwordStrength.number') },
      { regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, points: 20, label: t('passwordStrength.specialChar') },
      { regex: /.{12,}/, points: 10, label: t('passwordStrength.12CharsBonus') }
    ];
    const passed = checks.map(check => ({ ...check, passed: check.regex.test(password) }));
    score = passed.reduce((total, check) => total + (check.passed ? check.points : 0), 0);
    if (/(.)\1{2,}/.test(password)) score -= 20;
    if (/123|abc|password|qwerty/i.test(password)) score -= 30;
    return { score: Math.max(0, Math.min(100, score)), checks: passed, level: getPasswordLevel(score) };
  };

  const getPasswordLevel = (score: number): string => {
    if (score < 40) return t('passwordStrength.weak');
    if (score < 70) return t('passwordStrength.medium');
    if (score < 90) return t('passwordStrength.strong');
    return t('passwordStrength.excellent');
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
    if (!formData.name.trim()) newErrors.name = t('validation.nameRequired');
    else if (formData.name.length < 2) newErrors.name = t('validation.nameTooShort');
    if (!formData.email.trim()) newErrors.email = t('validation.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('validation.emailInvalid');
    if (formData.phoneNumber.trim() && !/^\+?[1-9]\d{1,15}$/.test(formData.phoneNumber.replace(/[\s\-()]/g, ''))) newErrors.phoneNumber = t('validation.phoneInvalid');
    if (!formData.password) newErrors.password = t('validation.passwordRequired');
    else if (getPasswordStrength(formData.password).score < 40) newErrors.password = t('validation.passwordTooWeak');
    if (!formData.confirmPassword) newErrors.confirmPassword = t('validation.confirmPasswordRequired');
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('validation.passwordsDoNotMatch');
    if (!formData.agreeToTerms) newErrors.agreeToTerms = t('validation.agreeToTermsRequired');
    if (!formData.agreeToPrivacy) newErrors.agreeToPrivacy = t('validation.agreeToPrivacyRequired');
    if (!formData.confirmAge) newErrors.confirmAge = t('validation.confirmAgeRequired');
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
        setErrors({ general: result.message || t('validation.registrationError') });
        return;
      }

      // Optionally, store some non-sensitive info if needed for the next step
      localStorage.setItem('signup_progress', JSON.stringify({ step: 1, userId: result.userId, role: formData.role }));
      
      router.push('/auth/signup/step-2');

    } catch (error) {
      console.error('Signup step 1 error:', error);
      setErrors({ general: t('validation.somethingWentWrong') });
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
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 mx-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('title')}</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
      </div>
      
      <DynamicProgressTracker currentStep={1} totalSteps={3} stepLabels={[t('progress.account'), t('progress.profile'), t('progress.upload')]} />
      
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
            <span className="text-lg font-bold text-blue-900 dark:text-blue-300">{t('talentSignUp')}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('talentDescription')}</span>
          </div>
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('fullName')} <span className="text-red-500">*</span></label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                    <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder={t('fullNamePlaceholder')} />
                  </div>
                  {errors.name && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emailAddress')} <span className="text-red-500">*</span></label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                    <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder={t('emailAddressPlaceholder')} />
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('phoneNumber')} <span className="text-gray-500 text-xs">({t('optional')})</span></label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-gray-400" /></div>
                    <input id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" value={formData.phoneNumber} onChange={handleChange} className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder={t('phoneNumberPlaceholder')} />
                  </div>
                  {errors.phoneNumber && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.phoneNumber}</p>}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('password')} <span className="text-red-500">*</span></label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleChange} className={`appearance-none block w-full pl-10 pr-10 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder={t('passwordPlaceholder')} />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{t('passwordStrength.title')}</span>
                        <span className={`font-medium ${passwordStrength.level === 'weak' ? 'text-red-600' : passwordStrength.level === 'medium' ? 'text-yellow-600' : passwordStrength.level === 'strong' ? 'text-blue-600' : 'text-green-600'}`}>
                          {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.level)}`} style={{ width: `${passwordStrength.score}%` }}></div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                        {passwordStrength.checks.slice(0, 4).map((check) => (
                          <div key={check.label} className={`flex items-center ${check.passed ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {check.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.password}</p>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('confirmPassword')} <span className="text-red-500">*</span></label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                    <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} className={`appearance-none block w-full pl-10 pr-10 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder={t('confirmPasswordPlaceholder')} />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.confirmPassword}</p>}
                </div>
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-start">
                    <div className="flex items-center h-5"><input id="agreeToTerms" name="agreeToTerms" type="checkbox" checked={formData.agreeToTerms} onChange={handleCheckboxChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" /></div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agreeToTerms" className="text-gray-700 dark:text-gray-300">{t('agreeTo')} <button type="button" onClick={() => setShowTermsModal(true)} className="text-blue-600 hover:text-blue-700 font-medium underline">{t('termsOfService')}</button> <span className="text-red-500">*</span></label>
                    </div>
                  </div>
                  {errors.agreeToTerms && <p className="text-sm text-red-600 ml-7 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.agreeToTerms}</p>}
                  <div className="flex items-start">
                    <div className="flex items-center h-5"><input id="agreeToPrivacy" name="agreeToPrivacy" type="checkbox" checked={formData.agreeToPrivacy} onChange={handleCheckboxChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" /></div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agreeToPrivacy" className="text-gray-700 dark:text-gray-300">{t('agreeTo')} <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-blue-600 hover:text-blue-700 font-medium underline">{t('privacyPolicy')}</button> <span className="text-red-500">*</span></label>
                    </div>
                  </div>
                  {errors.agreeToPrivacy && <p className="text-sm text-red-600 ml-7 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.agreeToPrivacy}</p>}
                  <div className="flex items-start">
                    <div className="flex items-center h-5"><input id="confirmAge" name="confirmAge" type="checkbox" checked={formData.confirmAge} onChange={handleCheckboxChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" /></div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="confirmAge" className="text-gray-700 dark:text-gray-300">{t('confirmAge')} <span className="text-red-500">*</span></label>
                    </div>
                  </div>
                  {errors.confirmAge && <p className="text-sm text-red-600 ml-7 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.confirmAge}</p>}
                  <div className="flex items-start">
                    <div className="flex items-center h-5"><input id="agreeToMarketing" name="agreeToMarketing" type="checkbox" checked={formData.agreeToMarketing} onChange={handleCheckboxChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" /></div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agreeToMarketing" className="text-gray-700 dark:text-gray-300">{t('agreeToMarketing')} ({t('optional')})</label>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-red-500 hover:from-blue-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl">
                    {loading ? (
                      <div className="flex items-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>{t('saving')}</div>
                    ) : (
                      t('continueToProfileSetup')
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">{t('alreadyHaveAccount')}</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">{t('signInInstead')}</Link>
              </div>
            </div>
          </div>

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
                    {t('termsOfService')}
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
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('terms.acceptance.title')}</h4>
                    <p>{t('terms.acceptance.content')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('terms.useLicense.title')}</h4>
                    <p>{t('terms.useLicense.content')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('terms.userAccounts.title')}</h4>
                    <p>{t('terms.userAccounts.content')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('terms.responsibilities.title')}</h4>
                    <p>{t('terms.responsibilities.content')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('terms.prohibitedUses.title')}</h4>
                    <p>{t('terms.prohibitedUses.content')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('terms.termination.title')}</h4>
                    <p>{t('terms.termination.content')}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowTermsModal(false)}
                >
                  {t('iUnderstand')}
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
                    {t('privacyPolicy')}
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
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.collect.title')}</h4>
                    <p>{t('privacy.collect.content')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.use.title')}</h4>
                    <p>{t('privacy.use.content')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.sharing.title')}</h4>
                    <p>{t('privacy.sharing.content')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.security.title')}</h4>
                    <p>{t('privacy.security.content')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.cookies.title')}</h4>
                    <p>{t('privacy.cookies.content')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.rights.title')}</h4>
                    <p>{t('privacy.rights.content')}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowPrivacyModal(false)}
                >
                  {t('iUnderstand')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

