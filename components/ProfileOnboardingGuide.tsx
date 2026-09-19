"use client";

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, ChevronRight, ChevronLeft, Sparkles, User, Briefcase, MapPin, FileText, Image as ImageIcon, Award } from 'lucide-react';
import useFocusTrap from '@/hooks/useFocusTrap';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartEdit: () => void;
  profileData: {
    name?: string;
    role?: string;
    location?: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    categoryId?: string | null;
    subcategoryId?: string | null;
    skills?: string[];
    languages?: string[];
  };
}

export default function ProfileOnboardingGuide({ isOpen, onClose, onStartEdit, profileData }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, isOpen && mounted);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to 3YESES! 🎉',
      description: "Let's set up your talent profile so you can get discovered. We'll guide you through each step.",
      icon: <Sparkles size={32} className="text-blue-500 dark:text-red-500" />,
      fields: [],
    },
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Set your name, professional role, and location so people know who you are and where you work.',
      icon: <User size={32} className="text-blue-500 dark:text-red-500" />,
      fields: ['name', 'role', 'location'],
    },
    {
      id: 'category',
      title: 'Choose Your Category',
      description: 'Select the category and subcategory that best describes your talent area. This helps people find you.',
      icon: <Briefcase size={32} className="text-blue-500 dark:text-red-500" />,
      fields: ['categoryId'],
    },
    {
      id: 'bio',
      title: 'Tell Your Story',
      description: 'Write a compelling bio that highlights your experience, achievements, and what makes you unique.',
      icon: <FileText size={32} className="text-blue-500 dark:text-red-500" />,
      fields: ['bio'],
    },
    {
      id: 'media',
      title: 'Add Visual Appeal',
      description: 'Upload a professional avatar and banner image to make your profile stand out.',
      icon: <ImageIcon size={32} className="text-blue-500 dark:text-red-500" />,
      fields: ['avatarUrl', 'bannerUrl'],
    },
    {
      id: 'skills',
      title: 'Showcase Your Skills',
      description: 'Add your skills and languages to demonstrate your capabilities and increase your reach.',
      icon: <Award size={32} className="text-blue-500 dark:text-red-500" />,
      fields: ['skills', 'languages'],
    },
  ];

  const getFieldStatus = (field: string): boolean => {
    const value = profileData[field as keyof typeof profileData];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined;
  };

  const getStepCompletion = (step: OnboardingStep): number => {
    if (step.fields.length === 0) return 100;
    const completedFields = step.fields.filter(getFieldStatus).length;
    return Math.round((completedFields / step.fields.length) * 100);
  };

  const currentStepData = steps[currentStep];
  const completion = getStepCompletion(currentStepData);
  const isLastStep = currentStep === steps.length - 1;
  const overallCompletion = Math.round(
    (steps.reduce((sum, step) => sum + getStepCompletion(step), 0) / steps.length)
  );

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="ui-modal-layer fixed inset-0 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close setup guide" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="profile-setup-title" className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-blue-500/20 bg-light-surface shadow-2xl dark:border-red-500/20 dark:bg-dark-surface">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-red-500 dark:from-red-600 dark:to-blue-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-light-surface/20 dark:bg-dark-surface/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              {currentStepData.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium opacity-90 mb-1">
                Step {currentStep + 1} of {steps.length}
              </div>
              <h2 id="profile-setup-title" className="text-2xl font-bold">{currentStepData.title}</h2>
            </div>
          </div>
          <div className="w-full bg-light-surface/20 dark:bg-dark-surface/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-light-surface h-full transition-all duration-500 rounded-full"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="mb-6 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
            {currentStepData.description}
          </p>

          {currentStepData.fields.length > 0 && (
            <div className="space-y-3 mb-6">
              {currentStepData.fields.map((field) => {
                const isComplete = getFieldStatus(field);
                return (
                  <div
                    key={field}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      isComplete
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500/50'
                        : 'bg-light-surface dark:bg-dark-surface border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isComplete
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {isComplete ? <Check size={16} /> : ''}
                    </div>
                    <span className="font-medium capitalize text-slate-900 dark:text-white">
                      {field === 'categoryId' ? 'Category' : field}
                    </span>
                    {isComplete && (
                      <span className="ml-auto text-sm text-green-600 dark:text-green-400 font-semibold">
                        Completed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {currentStep === 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-500 dark:bg-red-500 rounded-full flex items-center justify-center">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Overall Progress</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{overallCompletion}% Complete</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-red-500 dark:from-red-600 dark:to-blue-600 h-full transition-all duration-500"
                  style={{ width: `${overallCompletion}%` }}
                />
              </div>
            </div>
          )}

          {completion === 100 && currentStepData.fields.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500/50 rounded-xl p-4 text-center">
              <Check size={32} className="text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-green-700 dark:text-green-400">
                This step is complete! 🎉
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-light-surface dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-slate-900 transition-all hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-white dark:hover:border-red-500"
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg px-6 py-3 font-semibold text-slate-600 transition-all hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              Skip for now
            </button>
            {isLastStep ? (
              <button
                onClick={() => {
                  onStartEdit();
                  onClose();
                }}
                className="px-8 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-blue-500 to-red-500 dark:from-red-600 dark:to-blue-600 text-white hover:shadow-lg hover:scale-105 flex items-center gap-2"
              >
                Start Editing
                <Sparkles size={20} />
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="px-8 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-blue-500 to-red-500 dark:from-red-600 dark:to-blue-600 text-white hover:shadow-lg hover:scale-105 flex items-center gap-2"
              >
                Next
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
