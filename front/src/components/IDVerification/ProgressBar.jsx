import React from 'react';
import { Check } from 'lucide-react';

const ProgressBar = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Front ID' },
    { number: 2, title: 'Back ID' },
    { number: 3, title: 'Selfie' },
    { number: 4, title: 'Verify' },
    { number: 5, title: 'Complete' }
  ];

  return (
    <div className="w-full py-4">
      <div className="flex justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 w-full -z-10" />
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-blue-500 transition-all duration-500 -z-10" 
          style={{ width: `${(currentStep - 1) * 25}%` }}
        />
        
        {/* Steps */}
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 
                ${currentStep >= step.number 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border-2 border-gray-200'}`}
            >
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{step.number}</span>
              )}
            </div>
            <span className="text-sm text-gray-600">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;