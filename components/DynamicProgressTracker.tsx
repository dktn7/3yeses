import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProgressStep {
  number: number;
  label: string;
  completed: boolean;
  active: boolean;
}

interface DynamicProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function DynamicProgressTracker({ currentStep, totalSteps, stepLabels }: DynamicProgressTrackerProps) {
  const steps: ProgressStep[] = Array.from({ length: totalSteps }, (_, index) => ({
    number: index + 1,
    label: stepLabels[index] || `Step ${index + 1}`,
    completed: index + 1 < currentStep,
    active: index + 1 === currentStep
  }));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {/* Step Circle */}
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : step.active 
                    ? 'bg-gradient-to-r from-blue-600 to-red-500 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`ml-1 text-xs font-medium hidden sm:inline transition-colors duration-300 ${
                  step.completed 
                    ? 'text-green-600' 
                    : step.active 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`w-4 h-0.5 transition-colors duration-300 ${
                  step.completed 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                    : step.active 
                    ? 'bg-gradient-to-r from-blue-500 to-gray-300' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep} of {totalSteps}: {stepLabels[currentStep - 1]}
        </p>
      </div>
    </div>
  );
}
