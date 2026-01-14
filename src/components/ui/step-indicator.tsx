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
    <div className="flex items-center gap-4 lg:gap-8 bg-slate-50 p-3 lg:p-4 rounded-2xl border border-slate-100 shadow-sm transition-all duration-500 overflow-x-auto no-scrollbar">
      {steps.map((s, i) => {
        const isActive = currentStep === s.id;
        const isCompleted = currentStep > s.id;
        
        return (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-3 shrink-0">
              <div 
                className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center font-black transition-all duration-500 ${
                  isActive ? "shadow-lg scale-110" : ""
                }`}
                style={{ 
                  backgroundColor: isActive || isCompleted ? primaryColor : "#f1f5f9",
                  color: isActive || isCompleted ? "white" : "#94a3b8"
                }}
              >
                {isCompleted ? <CheckCircle size={22} weight="bold" /> : s.id}
              </div>
              <div className="hidden sm:block">
                <p className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${isActive ? "text-slate-900" : "text-slate-400"}`}>Passo {s.id}</p>
                <p className={`text-xs lg:text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-400"} whitespace-nowrap`}>{s.title}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="h-px w-4 lg:w-8 bg-slate-200 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
