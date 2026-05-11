import React from 'react';
import { InputForm } from './InputForm';
import { RecentlyProcessedList } from './RecentlyProcessedList';
import { GenerationRail } from './GenerationRail';
import { PageHeader } from '../Scholar';
import { useI18n } from '../../contexts/I18nContext';
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
 * Scholar v4 Workshop — idle Dashboard state.
 *   ≥1024 px: two-column grid, input card + 300 px dark feature rail
 *   <1024 px: single column, rail stacks under input card
 * Header uses the shared Scholar PageHeader for cross-page consistency.
 */
export const WorkshopPanel: React.FC<WorkshopPanelProps> = ({ onProcessInput, onOpenHistory }) => {
  const { t } = useI18n();

  // Visual-only rail toggles; real submission lives inside InputForm CTAs.
  const [includeSummary, setIncludeSummary] = React.useState(true);
  const [includeFlashcards, setIncludeFlashcards] = React.useState(true);

  return (
    <>
      <PageHeader
        eyebrow={t('workshop.eyebrow')}
        title={t('workshop.title')}
        className="mb-8"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8">
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
