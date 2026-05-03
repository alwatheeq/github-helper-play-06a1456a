import React from 'react';
import { InputForm } from './InputForm';
import { RecentlyProcessedList } from './RecentlyProcessedList';
import { GenerationRail } from './GenerationRail';
import { QuoteCard } from './QuoteCard';
import { RightRail } from '../Scholar';
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
 * Two-column workshop area for the idle Dashboard view.
 * Primary column: input form + recently-processed list.
 * Right rail (320px, sticky, hidden < lg): generation toggles + quote card.
 */
export const WorkshopPanel: React.FC<WorkshopPanelProps> = ({ onProcessInput, onOpenHistory }) => {
  // Mirror of InputForm's internal generation prefs for the rail toggles.
  // v1: rail toggles are display-only and Examination/Mind map don't drive logic yet.
  const [includeSummary, setIncludeSummary] = React.useState(true);
  const [includeFlashcards, setIncludeFlashcards] = React.useState(true);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="min-w-0 flex-1">
        <InputForm onProcessInput={onProcessInput} />
        <RecentlyProcessedList onOpenHistory={onOpenHistory} />
      </div>
      <RightRail className="hidden lg:block" sticky>
        <GenerationRail
          includeSummary={includeSummary}
          includeFlashcards={includeFlashcards}
          onToggleSummary={setIncludeSummary}
          onToggleFlashcards={setIncludeFlashcards}
        />
        <QuoteCard />
      </RightRail>
    </div>
  );
};

export default WorkshopPanel;
