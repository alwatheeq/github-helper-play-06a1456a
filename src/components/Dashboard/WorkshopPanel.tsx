import React from 'react';
import { InputForm } from './InputForm';
import { RecentlyProcessedList } from './RecentlyProcessedList';
import { GenerationRail } from './GenerationRail';
import type { AcademicsGenerationPreferences } from '../../utils/academicsGenerationPreferences';

interface WorkshopPanelProps {
  onProcessInput: (
    input: File | string,
    flashcardCount: number,
    fromSummary: boolean,
    medicalMode?: boolean,
    useOCR?: boolean,
    generationPrefs?: AcademicsGenerationPreferences
  ) => void;
  onOpenHistory?: () => void;
}

/**
 * Idle Dashboard layout — strict editorial spec.
 * Two-column grid: 1fr (input card) + 300px (dark feature card).
 * Recently-processed list sits below, full-width.
 * No nested cards, no horizontal scroll on a 1366px laptop.
 */
export const WorkshopPanel: React.FC<WorkshopPanelProps> = ({ onProcessInput, onOpenHistory }) => {
  // v1: rail toggles are visual only; submit happens via InputForm CTAs.
  const [includeSummary, setIncludeSummary] = React.useState(true);
  const [includeFlashcards, setIncludeFlashcards] = React.useState(true);

  return (
    <>
      <div
        className="grid gap-8"
        style={{ gridTemplateColumns: 'minmax(0, 1fr) 300px' }}
      >
        <div className="min-w-0">
          <InputForm onProcessInput={onProcessInput} />
        </div>
        <div className="min-w-0">
          <GenerationRail
            includeSummary={includeSummary}
            includeFlashcards={includeFlashcards}
            onToggleSummary={setIncludeSummary}
            onToggleFlashcards={setIncludeFlashcards}
          />
        </div>
      </div>

      <RecentlyProcessedList onOpenHistory={onOpenHistory} />
    </>
  );
};

export default WorkshopPanel;
