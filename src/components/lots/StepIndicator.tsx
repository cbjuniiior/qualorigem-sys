import { Check } from "@phosphor-icons/react";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const StepIndicator = ({ steps, currentStep, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      {steps.map((step) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const Icon = step.icon;
        
        return (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`flex-1 flex flex-col items-center gap-2 pb-2 transition-all relative ${
              isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              isActive
                ? 'bg-gray-900 text-white'
                : isCompleted
                ? 'bg-gray-200 text-gray-600'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {isCompleted ? <Check className="w-4 h-4" /> : step.id}
            </div>
            <span className="text-xs font-medium text-gray-700">{step.title}</span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
        );
      })}
    </div>
  );
};
