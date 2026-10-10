'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MdVisibility, MdVisibilityOff, MdWarning, MdPerson, MdChildCare, MdSecurity, MdCheckCircle, MdClose } from 'react-icons/md';
import SwoopingTick from '@/components/SwoopingTick';
import CustomPhoneInput from '@/components/CustomPhoneInput';
import DatePicker from '@/components/DatePicker';

interface FormErrors {
  dateOfBirth?: string;
  firstName?: string;
  lastName?: string;
  childFirstName?: string;
  childLastName?: string;
  parentFirstName?: string;
  parentLastName?: string;
  email?: string;
  parentEmail?: string;
  phone?: string;
  parentPhone?: string;
  password?: string;
  confirmPassword?: string;
  parentalConsent?: string;
  termsAccepted?: string;
  parentName?: string;
  parentContactEmail?: string;
}

type AccountType = 'SELF' | 'PARENT_MANAGED' | null;
type AccountChoice = 'SELF_WITH_CONSENT' | 'PARENT_MANAGED' | null;

export default function SignupStep1() {
  const router = useRouter();
  const t = useTranslations('Auth.signup');
  
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [accountType, setAccountType] = useState<AccountType>('SELF'); // Default to normal adult form
  const [isMinor, setIsMinor] = useState(false);
  const [showAccountChoice, setShowAccountChoice] = useState(false); // For 13-17 to choose account type
  const [teenAccountChoice, setTeenAccountChoice] = useState<AccountChoice>(null);
  
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const [formData, setFormData] = useState({
    // For adults (SELF)
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // For parent-managed (PARENT_MANAGED)
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    childFirstName: '',
    childLastName: '',
    childDateOfBirth: '',
    
    // For teen self-managed with consent (SELF_WITH_CONSENT)
    parentName: '',
    parentContactEmail: '',
    
    // Legal
    parentalConsentGiven: false,
    termsAccepted: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Calculate age from date of birth
  useEffect(() => {
    if (dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      setAge(calculatedAge);
      
      // Determine account type based on age
      if (calculatedAge < 13) {
        // Under 13: Parent-managed only (COPPA compliance)
        setAccountType('PARENT_MANAGED');
        setIsMinor(true);
        setShowAccountChoice(false);
        setTeenAccountChoice(null);
      } else if (calculatedAge >= 13 && calculatedAge < 16) {
        // 13-15: Show choice between self-managed with consent or parent-managed
        setIsMinor(true);
        setShowAccountChoice(true);
        // Don't set accountType until user chooses
        if (!teenAccountChoice) {
          setAccountType(null); // Wait for user choice
        }
      } else {
        // 16+: Standard self-managed account (no parental consent needed)
        setAccountType('SELF');
        setIsMinor(false);
        setShowAccountChoice(false);
        setTeenAccountChoice(null);
      }
    } else {
      setAge(null);
      setAccountType('SELF'); // Show default form when no DOB entered
      setIsMinor(false);
      setShowAccountChoice(false);
      setTeenAccountChoice(null);
    }
  }, [dateOfBirth, teenAccountChoice]);

  // Password strength validation
  const getPasswordStrength = () => {
    const password = formData.password;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    
    return {
      checks,
      strength: passedChecks === 4 ? 'strong' : passedChecks >= 2 ? 'medium' : 'weak',
      isValid: Object.values(checks).every(Boolean)
    };
  };

  const passwordStrength = getPasswordStrength();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Date of birth is always required
    if (!dateOfBirth) {
      newErrors.dateOfBirth = t('errors.dateOfBirthRequired');
      setErrors(newErrors);
      return false;
    }

    // Check age >= 13
    if (age !== null && age < 13) {
      newErrors.dateOfBirth = t('errors.minimumAge13');
      setErrors(newErrors);
      return false;
    }

    if (accountType === 'SELF') {
      // Adult validation (or teen with consent)
      if (!formData.firstName.trim()) newErrors.firstName = t('errors.firstNameRequired');
      if (!formData.lastName.trim()) newErrors.lastName = t('errors.lastNameRequired');
      if (!formData.email.trim()) {
        newErrors.email = t('errors.emailRequired');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('errors.emailInvalid');
      }
      if (!formData.phone.trim()) newErrors.phone = t('errors.phoneRequired');
      
      // Additional validation for teens with consent
      if (teenAccountChoice === 'SELF_WITH_CONSENT') {
        if (!formData.parentName.trim()) {
          newErrors.parentName = t('errors.parentGuardianNameRequired');
        }
        if (!formData.parentContactEmail.trim()) {
          newErrors.parentContactEmail = t('errors.parentGuardianEmailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentContactEmail)) {
          newErrors.parentContactEmail = t('errors.parentGuardianEmailInvalid');
        }
        // Ensure parent email is different from teen's email
        if (formData.parentContactEmail.toLowerCase() === formData.email.toLowerCase()) {
          newErrors.parentContactEmail = t('errors.parentGuardianEmailMustDiffer');
        }
      }
      
    } else if (accountType === 'PARENT_MANAGED') {
      // Parent-managed validation
      if (!formData.parentFirstName.trim()) newErrors.parentFirstName = t('errors.firstNameRequired');
      if (!formData.parentLastName.trim()) newErrors.parentLastName = t('errors.lastNameRequired');
      if (!formData.parentEmail.trim()) {
        newErrors.parentEmail = t('errors.emailRequired');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
        newErrors.parentEmail = t('errors.emailInvalid');
      }
      if (!formData.parentPhone.trim()) newErrors.parentPhone = t('errors.phoneRequired');
      if (!formData.childFirstName.trim()) newErrors.childFirstName = t('errors.childFirstNameRequired');
      if (!formData.childLastName.trim()) newErrors.childLastName = t('errors.childLastNameRequired');
      if (!formData.parentalConsentGiven) newErrors.parentalConsent = t('errors.parentalConsentRequired');
    }

    // Password validation (same for both)
    if (!formData.password) {
      newErrors.password = t('errors.passwordRequired');
    } else if (!passwordStrength.isValid) {
      newErrors.password = t('errors.passwordWeak');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordMismatch');
    }

    // Terms acceptance required for both
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = t('errors.termsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data based on account type
      const step1Data = {
        accountType,
        isMinor,
        dateOfBirth,
        ...(accountType === 'SELF' ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          // Include parent contact info for teens with consent
          ...(teenAccountChoice === 'SELF_WITH_CONSENT' ? {
            parentalConsentRequired: true,
            parentName: formData.parentName,
            parentEmail: formData.parentContactEmail, // Changed from parentContactEmail
          } : {}),
        } : {
          parentFirstName: formData.parentFirstName,
          parentLastName: formData.parentLastName,
          parentEmail: formData.parentEmail,
          parentPhone: formData.parentPhone,
          childFirstName: formData.childFirstName,
          childLastName: formData.childLastName,
          childDateOfBirth: formData.childDateOfBirth,
          parentalConsentGiven: formData.parentalConsentGiven,
        }),
        password: formData.password,
        termsAccepted: formData.termsAccepted,
        termsAcceptedAt: new Date().toISOString(),
      };
      
      // Store data in session storage for next steps
      sessionStorage.setItem('signupStep1', JSON.stringify(step1Data));
      
      // Navigate to step 2
      router.push('/auth/signup/steps/step-2');
    } catch (error) {
      console.error('Step 1 error:', error);
      setErrors({ email: t('errors.serverError') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear related error (handle field name mapping)
    const errorField = field === 'parentalConsentGiven' ? 'parentalConsent' : 
                       field === 'termsAccepted' ? 'termsAccepted' : field;
    if (errors[errorField as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [errorField]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 dark:from-[#1a0508] dark:via-[#2d080d] dark:to-[#0f0204] px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('step1Title')}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">1 / 3</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-600 to-red-600 h-2 rounded-full transition-all duration-300" style={{ width: '33.33%' }}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-blue-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <SwoopingTick size={52} className="text-primary-blue dark:text-accent-red" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent mb-2">
              {t('step1Title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{t('step1Description')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date of Birth - FIRST FIELD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dateOfBirth')} <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={dateOfBirth}
                onChange={(val) => {
                  setDateOfBirth(val);
                  if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: undefined }));
                }}
                maxDate={new Date().toISOString().split('T')[0]}
                placeholder={t('dateOfBirthPlaceholder')}
              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateOfBirth}</p>}
            </div>

            {/* Under 13 - Parent-Managed Required */}
            {age !== null && age < 13 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <MdWarning className="text-amber-500 mt-0.5 mr-3 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="text-amber-800 dark:text-amber-300 font-semibold mb-1">
                        Parent-Managed Account Required
                      </h3>
                      <p className="text-amber-700 dark:text-amber-400 text-sm">
                        {t('under13ParentManagedDescription')}
                      </p>
                    </div>
                  </div>
                </div>
            )}

            {/* Account Type Choice for 13-15 */}
            {showAccountChoice && (
              <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Choose Your Account Type
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
                  Since you're between 13-15 years old, you have two options:
                </p>
                
                <div className="space-y-3">
                  {/* Self-Managed with Parental Consent */}
                  <button
                    type="button"
                    onClick={() => {
                      setTeenAccountChoice('SELF_WITH_CONSENT');
                      setAccountType('SELF');
                      setShowAccountChoice(false);
                    }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      teenAccountChoice === 'SELF_WITH_CONSENT'
                        ? 'border-primary-blue dark:border-accent-red bg-blue-50 dark:bg-red-500/15'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-red-400/50 bg-light-surface dark:bg-dark-surface'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          teenAccountChoice === 'SELF_WITH_CONSENT'
                            ? 'border-primary-blue bg-primary-blue dark:border-accent-red dark:bg-accent-red'
                            : 'border-gray-400'
                        }`}>
                          {teenAccountChoice === 'SELF_WITH_CONSENT' && (
                            <div className="w-2 h-2 rounded-full bg-light-surface"></div>
                          )}
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {t('selfManagedWithConsentTitle')}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('selfManagedWithConsentDescription')}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Parent-Managed Account */}
                  <button
                    type="button"
                    onClick={() => {
                      setTeenAccountChoice('PARENT_MANAGED');
                      setAccountType('PARENT_MANAGED');
                      setShowAccountChoice(false);
                    }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      teenAccountChoice === 'PARENT_MANAGED'
                        ? 'border-primary-blue dark:border-accent-red bg-blue-50 dark:bg-red-500/15'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-red-400/50 bg-light-surface dark:bg-dark-surface'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          teenAccountChoice === 'PARENT_MANAGED'
                            ? 'border-primary-blue bg-primary-blue dark:border-accent-red dark:bg-accent-red'
                            : 'border-gray-400'
                        }`}>
                          {teenAccountChoice === 'PARENT_MANAGED' && (
                            <div className="w-2 h-2 rounded-full bg-light-surface"></div>
                          )}
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {t('parentManagedOptionTitle')}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('parentManagedOptionDescription')}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Parent-Managed Account Warning (13-15 or under 13) */}
            {accountType === 'PARENT_MANAGED' && !showAccountChoice && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <MdWarning className="text-amber-500 mt-0.5 mr-3 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="text-amber-800 dark:text-amber-300 font-semibold mb-1">
                      {t('parentManagedAccount')}
                    </h3>
                    <p className="text-amber-700 dark:text-amber-400 text-sm">
                      {t('parentManagedAccountDescription')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SELF Account Form (16+ or 13-15 with parental consent) */}
            {accountType === 'SELF' && !showAccountChoice && (age === null || age >= 16 || teenAccountChoice === 'SELF_WITH_CONSENT') && (
              <div className="space-y-5">
                {/* Show info banner for teens */}
                {teenAccountChoice === 'SELF_WITH_CONSENT' && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-lg">
                    <div className="flex items-start">
                      <MdWarning className="text-amber-500 mt-0.5 mr-3 flex-shrink-0" size={24} />
                      <div>
                        <h3 className="text-amber-800 dark:text-amber-300 font-semibold mb-1">
                          {t('parentalConsentRequiredTitle')}
                        </h3>
                        <p className="text-amber-700 dark:text-amber-400 text-sm">
                          {t('parentalConsentRequiredDescription')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('firstName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder={t('firstNamePlaceholder')}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red transition-all`}
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('lastName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      placeholder={t('lastNamePlaceholder')}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red transition-all`}
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red transition-all`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('phone')} <span className="text-red-500">*</span>
                  </label>
                  <CustomPhoneInput
                    value={formData.phone}
                    onChange={(value) => handleChange('phone', value)}
                    error={!!errors.phone}
                    placeholder={t('phonePlaceholder') || 'Enter phone number'}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                </div>

                {/* Parent Contact Info for Teens with Consent */}
                {teenAccountChoice === 'SELF_WITH_CONSENT' && (
                  <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MdPerson className="text-primary-blue dark:text-accent-red" size={24} />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {t('parentGuardianContactInformation')}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {t('parentGuardianContactDescription')}
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('parentGuardianFullName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.parentName}
                        onChange={(e) => handleChange('parentName', e.target.value)}
                        placeholder={t('parentGuardianFullNamePlaceholder')}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.parentName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red transition-all`}
                      />
                      {errors.parentName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.parentName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('parentGuardianEmail')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.parentContactEmail}
                        onChange={(e) => handleChange('parentContactEmail', e.target.value)}
                        placeholder={t('parentGuardianEmailPlaceholder')}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.parentContactEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red transition-all`}
                      />
                      {errors.parentContactEmail && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.parentContactEmail}</p>}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t('parentGuardianConsentEmailHint')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PARENT_MANAGED Account Form (13-15 or under 13) */}
            {accountType === 'PARENT_MANAGED' && age !== null && age < 16 && (
              <div className="space-y-6">
                {/* Parent/Guardian Information Section */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-4">
                    <MdPerson className="text-primary-blue dark:text-accent-red" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {t('parentGuardianInfo')}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('yourInformation')}</p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('parentFirstName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.parentFirstName}
                          onChange={(e) => handleChange('parentFirstName', e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-lg border ${errors.parentFirstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red`}
                        />
                        {errors.parentFirstName && <p className="mt-1 text-sm text-red-600">{errors.parentFirstName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('parentLastName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.parentLastName}
                          onChange={(e) => handleChange('parentLastName', e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-lg border ${errors.parentLastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red`}
                        />
                        {errors.parentLastName && <p className="mt-1 text-sm text-red-600">{errors.parentLastName}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('parentEmail')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) => handleChange('parentEmail', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.parentEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red`}
                      />
                      {errors.parentEmail && <p className="mt-1 text-sm text-red-600">{errors.parentEmail}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('parentPhone')} <span className="text-red-500">*</span>
                      </label>
                      <CustomPhoneInput
                        value={formData.parentPhone}
                        onChange={(value) => handleChange('parentPhone', value)}
                        error={!!errors.parentPhone}
                        placeholder={t('parentGuardianPhonePlaceholder')}
                      />
                      {errors.parentPhone && <p className="mt-1 text-sm text-red-600">{errors.parentPhone}</p>}
                    </div>
                  </div>
                </div>

                {/* Child's Information Section */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-4">
                    <MdChildCare className="text-primary-blue dark:text-accent-red" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {t('childTalentInfo')}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('childFirstName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.childFirstName}
                          onChange={(e) => handleChange('childFirstName', e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-lg border ${errors.childFirstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red`}
                        />
                        {errors.childFirstName && <p className="mt-1 text-sm text-red-600">{errors.childFirstName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('childLastName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.childLastName}
                          onChange={(e) => handleChange('childLastName', e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-lg border ${errors.childLastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red`}
                        />
                        {errors.childLastName && <p className="mt-1 text-sm text-red-600">{errors.childLastName}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('childDateOfBirth')}
                      </label>
                      <input
                        type="text"
                        value={dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : ''}
                        disabled
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password Section (for both account types) */}
            {(accountType === 'SELF' || accountType === 'PARENT_MANAGED') && (age === null || age >= 13) && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <MdSecurity className="text-primary-blue dark:text-accent-red" size={20} />
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                    {t('accountSecurity')}
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('password')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                        formData.password && !passwordStrength.isValid 
                          ? 'border-red-500' 
                          : formData.password && passwordStrength.isValid 
                            ? 'border-green-500'
                            : 'border-gray-300 dark:border-gray-600'
                      } bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Password Strength</span>
                        <span className={`text-xs font-semibold ${
                          passwordStrength.strength === 'strong' ? 'text-green-600' :
                          passwordStrength.strength === 'medium' ? 'text-red-600' : 'text-red-600'
                        }`}>
                          {passwordStrength.strength === 'strong' ? 'Strong' :
                           passwordStrength.strength === 'medium' ? 'Medium' : 'Weak'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 text-xs ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-500'}`}>
                          <MdCheckCircle className={passwordStrength.checks.length ? 'opacity-100' : 'opacity-30'} />
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <MdCheckCircle className={passwordStrength.checks.uppercase ? 'opacity-100' : 'opacity-30'} />
                          <span>Uppercase letter (A-Z)</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <MdCheckCircle className={passwordStrength.checks.lowercase ? 'opacity-100' : 'opacity-30'} />
                          <span>Lowercase letter (a-z)</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-500'}`}>
                          <MdCheckCircle className={passwordStrength.checks.number ? 'opacity-100' : 'opacity-30'} />
                          <span>Number (0-9)</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('confirmPassword')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder={t('confirmPasswordPlaceholder')}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {/* Parental Consent (for minors) */}
                {accountType === 'PARENT_MANAGED' && (
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.parentalConsentGiven}
                        onChange={(e) => handleChange('parentalConsentGiven', e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-blue dark:text-accent-red focus:ring-primary-blue dark:focus:ring-accent-red"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('parentalConsentText')} <span className="text-red-500">*</span>
                      </span>
                    </label>
                    {errors.parentalConsent && <p className="mt-1 text-sm text-red-600 ml-8">{errors.parentalConsent}</p>}
                  </div>
                )}

                {/* Terms & Conditions */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-blue dark:text-accent-red focus:ring-primary-blue dark:focus:ring-accent-red"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('iAgreeToThe')}{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-primary-blue dark:text-accent-red hover:underline font-medium"
                      >
                        {t('termsAndConditions')}
                      </button>{' '}
                      {t('and')}{' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-primary-blue dark:text-accent-red hover:underline font-medium"
                      >
                        {t('privacyPolicy')}
                      </button>
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.termsAccepted && <p className="mt-1 text-sm text-red-600 ml-8">{errors.termsAccepted}</p>}
                </div>
              </div>
            )}

            {/* Buttons */}
            {(accountType === 'SELF' || accountType === 'PARENT_MANAGED') && (age === null || age >= 13) && (
              <div className="flex gap-4 pt-4">
                <Link
                  href="/auth/signup"
                  className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-center"
                >
                  {t('back')}
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-blue to-primary-blue hover:from-primary-blue/90 hover:to-primary-blue/90 dark:from-accent-red dark:to-accent-red dark:hover:from-accent-red/90 dark:hover:to-accent-red/90 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : t('next')}
                </button>
              </div>
            )}
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('alreadyHaveAccount')}{' '}
            <Link href="/auth/signin" className="text-primary-blue hover:text-primary-blue/80 dark:text-accent-red dark:hover:text-accent-red/80 font-medium">
              {t('signIn')}
            </Link>
          </div>
        </div>

        {/* Terms Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Terms and Conditions</h2>
                <div className="flex gap-2">
                  <Link
                    href="/legal/terms"
                    target="_blank"
                    className="px-4 py-2 text-sm text-primary-blue hover:text-primary-blue/80 dark:text-accent-red dark:hover:text-accent-red/80 font-medium"
                  >
                    Open in new tab
                  </Link>
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MdClose size={24} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Acceptance of Terms</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  By accessing or using our platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our platform.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Use of Platform</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  You may use our platform for lawful purposes only. You are responsible for complying with all applicable laws and regulations.
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                  <li>You must be at least 13 years old to use our platform (with parental consent if under 18).</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li>You agree not to use our platform for any illegal or unauthorized purpose.</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Intellectual Property</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  The content and materials on our platform are protected by intellectual property laws. You may not use, reproduce, or distribute any content without our prior written permission.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Limitation of Liability</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We are not liable for any damages or losses arising from your use of our platform.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Governing Law</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  These Terms and Conditions shall be governed by and construed in accordance with applicable laws.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Changes to Terms</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We reserve the right to modify or update these Terms and Conditions at any time. Your continued use of our platform after any changes constitutes your acceptance of the new terms.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Privacy Policy</h2>
                <div className="flex gap-2">
                  <Link
                    href="/legal/privacy"
                    target="_blank"
                    className="px-4 py-2 text-sm text-primary-blue hover:text-primary-blue/80 dark:text-accent-red dark:hover:text-accent-red/80 font-medium"
                  >
                    Open in new tab
                  </Link>
                  <button
                    onClick={() => setShowPrivacyModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MdClose size={24} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Information We Collect</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                  <li>Personal information (name, email, phone number, date of birth)</li>
                  <li>Profile information (photos, videos, portfolio items)</li>
                  <li>Account credentials and preferences</li>
                  <li>Communication data when you contact us</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How We Use Your Information</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your transactions and send related information</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Protect against fraudulent or illegal activity</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Data Protection for Minors</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  For users under 18, we require parental consent and implement additional safeguards to protect their privacy and data. Parent/guardian information is collected and verified for accounts managed on behalf of minors.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Information Sharing</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We do not sell your personal information. We may share your information only in limited circumstances, such as with your consent, to comply with legal obligations, or to protect our rights.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Data Security</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We take reasonable measures to protect your information from unauthorized access, alteration, or destruction. However, no internet transmission is completely secure.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Your Rights</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  You have the right to access, update, or delete your personal information. Contact us if you wish to exercise these rights.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Changes to Privacy Policy</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
