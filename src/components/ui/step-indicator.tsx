import React from "react";
import { CheckCircle } from "@phosphor-icons/react";

interface Step {
  id: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  primaryColor: string;
}

export const FormStepIndicator = ({ steps, currentStep, primaryColor }: StepIndicatorProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:gap-x-4 lg:gap-x-6 bg-slate-50 p-3 lg:p-4 rounded-2xl border border-slate-100 shadow-sm transition-all duration-500">
      {steps.map((s, i) => {
        const isActive = currentStep === s.id;
        const isCompleted = currentStep > s.id;

        return (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-500 ${
                  isActive ? "shadow-lg scale-110" : ""
                }`}
                style={{
                  backgroundColor: isActive || isCompleted ? primaryColor : "#f1f5f9",
                  color: isActive || isCompleted ? "white" : "#94a3b8"
                }}
              >
                {isCompleted ? <CheckCircle size={18} weight="bold" className="sm:w-5 sm:h-5" /> : s.id}
              </div>
              <div className="min-w-0">
                <p className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest truncate ${isActive ? "text-slate-900" : "text-slate-400"}`}>Passo {s.id}</p>
                <p className={`text-[10px] sm:text-xs lg:text-sm font-bold truncate max-w-[72px] sm:max-w-none ${isActive ? "text-slate-900" : "text-slate-400"}`}>{s.title}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden sm:block h-px w-4 lg:w-6 bg-slate-200 shrink-0 self-center" aria-hidden />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
