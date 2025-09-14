'use client';

import { Check, User, Briefcase, Camera } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ProgressTrackerProps {
  currentStep: number;
  steps: Step[];
}

function getStepClasses(isCompleted: boolean, isCurrent: boolean): string {
  if (isCompleted) {
    return 'bg-primary-blue border-primary-blue text-white scale-110 shadow-lg';
  }
  if (isCurrent) {
    return 'bg-white dark:bg-gray-800 border-primary-blue text-primary-blue scale-110 shadow-lg animate-pulse';
  }
  return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500';
}

export default function ProgressTracker({ currentStep, steps }: Readonly<ProgressTrackerProps>) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full z-0">
          {/* Active Progress Line */}
          <div 
            className="h-1 bg-gradient-to-r from-primary-blue to-primary-red rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* Step Circle */}
              <div
                className={`
                  w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 transform
                  ${getStepClasses(isCompleted, isCurrent)}
                `}
              >
                {isCompleted ? (
                  <Check size={20} className="animate-bounce" />
                ) : (
                  <div className={`${isCurrent ? 'animate-pulse' : ''}`}>
                    {step.icon}
                  </div>
                )}
              </div>

              {/* Step Info */}
              <div className="mt-3 text-center max-w-24">
                <p 
                  className={`
                    text-sm font-semibold transition-colors duration-300
                    ${isCompleted || isCurrent 
                      ? 'text-primary-blue dark:text-primary-blue' 
                      : 'text-gray-400 dark:text-gray-500'
                    }
                  `}
                >
                  {step.title}
                </p>
                <p 
                  className={`
                    text-xs mt-1 transition-colors duration-300
                    ${isCompleted || isCurrent 
                      ? 'text-gray-600 dark:text-gray-300' 
                      : 'text-gray-400 dark:text-gray-500'
                    }
                  `}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const signupSteps: Step[] = [
  {
    id: 1,
    title: 'Account',
    description: 'Basic info',
    icon: <User size={20} />
  },
  {
    id: 2,
    title: 'Profile',
    description: 'Professional details',
    icon: <Briefcase size={20} />
  },
  {
    id: 3,
    title: 'Media',
    description: 'Photos & videos',
    icon: <Camera size={20} />
  }
];
