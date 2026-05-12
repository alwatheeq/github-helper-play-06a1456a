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
        <span className={`text-sm font-medium text-muted-ink dark:text-muted-ink-on-dark`}>
          {progressText}
        </span>
        <div className="flex space-x-1">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-colors duration-[var(--s4-dur-fast)] ${
                index + 1 <= stepNumber
                  ? `bg-accent-gold w-6`
                  : `bg-subtle dark:bg-subtle-on-dark w-1.5`
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Title */}
      <h3 className={`text-xl font-bold text-ink dark:text-ink-on-dark`}>
        {step.title}
      </h3>

      {/* Step Content */}
      <p className={`text-secondary-ink dark:text-secondary-ink-on-dark leading-relaxed`}>
        {step.content}
      </p>
    </div>
  );
};


