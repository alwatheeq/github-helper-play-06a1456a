import React, { useState, useContext } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n, I18nContext } from '../../contexts/I18nContext';
import { TutorialConfig } from './tutorialConfigs';
import { TutorialStep } from './TutorialStep';

interface PageTutorialProps {
  config: TutorialConfig;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

// Internal component that uses hooks
const PageTutorialContent: React.FC<PageTutorialProps> = ({
  config,
  isOpen,
  onClose,
  onComplete,
  onSkip,
}) => {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = config.steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const currentStepData = config.steps[currentStep];

  if (!isOpen) return null;

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
    // Reset to first step for next time (if needed)
    setCurrentStep(0);
  };

  const handleSkip = () => {
    onSkip();
    onClose();
    setCurrentStep(0);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Prevent closing by clicking backdrop
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-page bg-opacity-70 backdrop-blur-md"></div>

      {/* Tutorial Modal */}
      <div className="relative bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[var(--s4-shadow-modal)] max-w-2xl w-full overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-accent-gold p-6 text-white relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-card-light dark:bg-card-dark hover:bg-opacity-20 rounded-[var(--s4-radius-card)] transition-colors duration-150 group"
            aria-label={t('tutorial.skip')}
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>

          <div className="pr-12">
            <h2 className="s4-h2 mb-1">{config.title}</h2>
            <p className="text-ink-on-dark/90 text-sm">
              {t('tutorial.learn_this_page')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <TutorialStep
            step={currentStepData}
            stepNumber={currentStep + 1}
            totalSteps={totalSteps}
            stepLabel={t('tutorial.step_of', { current: currentStep + 1, total: totalSteps })}
          />
        </div>

        {/* Footer with Navigation */}
        <div className="border-t border-divider dark:border-divider-on-dark bg-accent-gold-soft/10 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="text-sm text-secondary-ink dark:text-muted-ink-on-dark hover:opacity-80 transition-opacity font-medium"
            >
              {t('tutorial.skip')}
            </button>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-3">
              {/* Previous Button */}
              {!isFirstStep && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 px-4 py-2 border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-ink dark:text-ink-on-dark"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>{t('tutorial.previous')}</span>
                </button>
              )}

              {/* Next/Close Button */}
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2 bg-accent-gold text-white rounded-[var(--s4-radius-card)] hover:opacity-80 transition-opacity font-semibold shadow-[var(--s4-shadow-hairline)]"
              >
                <span>{isLastStep ? t('tutorial.close') : t('tutorial.next')}</span>
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Wrapper component that checks context availability
export const PageTutorial: React.FC<PageTutorialProps> = (props) => {
  // Check if context is available before rendering
  const i18nContext = useContext(I18nContext);
  
  // If context is not available, don't render (this should never happen in normal flow)
  if (!i18nContext) {
    console.warn('PageTutorial: I18nContext not available, skipping render');
    return null;
  }
  
  // Context is available, render the component
  return <PageTutorialContent {...props} />;
};
