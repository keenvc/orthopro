'use client';

import { CheckCircle } from 'lucide-react';

interface StepProgressProps {
  currentStep: number;
}

export default function StepProgress({ currentStep }: StepProgressProps) {
  const steps = [
    { number: 1, label: 'Incident Details' },
    { number: 2, label: 'Patient History' },
    { number: 3, label: 'Current Symptoms' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex-1 relative">
            <div className="flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  step.number < currentStep
                    ? 'bg-green-600 text-white'
                    : step.number === currentStep
                    ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number < currentStep ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  step.number
                )}
              </div>
              
              {/* Step Label */}
              <span
                className={`mt-2 text-sm font-medium ${
                  step.number <= currentStep
                    ? 'text-gray-900'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            
            {/* Connecting Line */}
            {idx < steps.length - 1 && (
              <div
                className={`absolute top-6 left-1/2 w-full h-1 -z-10 transition-all ${
                  step.number < currentStep
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                }`}
                style={{ transform: 'translateX(6px)' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
