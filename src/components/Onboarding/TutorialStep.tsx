import React from 'react';
import { TutorialStep as TutorialStepType } from './tutorialConfigs';

interface TutorialStepProps {
  step: TutorialStepType;
  stepNumber: number;
  totalSteps: number;
  stepLabel?: string;
}

export const TutorialStep: React.FC<TutorialStepProps> = ({
  step,
  stepNumber,
  totalSteps,
  stepLabel,
}) => {
  const progressText = stepLabel ?? `Step ${stepNumber} of ${totalSteps}`;
  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-medium text-muted-ink dark:text-muted-ink-on-dark">
          {progressText}
        </span>
        <div className="flex space-x-1">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-[5px] rounded-[2px] transition-colors duration-150 ${
                index + 1 <= stepNumber
                  ? 'bg-accent-gold w-[22px]'
                  : 'bg-divider dark:bg-divider-on-dark w-2'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Title */}
      <h3 className="text-[20px] font-bold text-ink dark:text-ink-on-dark">
        {step.title}
      </h3>

      {/* Step Content */}
      <p className="text-[14px] text-secondary-ink dark:text-muted-ink-on-dark leading-[1.8]">
        {step.content}
      </p>
    </div>
  );
};


