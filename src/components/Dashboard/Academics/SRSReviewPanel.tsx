import React, { useCallback, useEffect, useState } from 'react';
import { Brain, RotateCcw, ChevronRight } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../Toast/Toast';
import { supabase } from '../../../lib/supabase';
import { Badge } from '../../Common/Badge';
import { calculateSRS, type SRSRating, type SRSState } from '../../../utils/srsAlgorithm';

interface Flashcard {
  front: string;
  back: string;
}

interface DueCard {
  itemId: string;
  flashcardIndex: number;
  front: string;
  back: string;
  srsState: SRSState;
}

interface SRSReviewPanelProps {
  courseId: string;
  itemIds: string[];
}

export const SRSReviewPanel: React.FC<SRSReviewPanelProps> = ({ courseId: _courseId, itemIds }) => {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const { error: showErrorToast } = useToast();
  const [dueCards, setDueCards] = useState<DueCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rating, setRating] = useState(false);

  void _courseId;

  const loadDueCards = useCallback(async () => {
    if (!user || itemIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const { data: srsRows, error: srsError } = await supabase
        .from('srs_flashcard_state')
        .select('item_id, flashcard_index, easiness_factor, interval_days, repetitions')
        .eq('user_id', user.id)
        .in('item_id', itemIds)
        .lte('next_review_at', new Date().toISOString());

      if (srsError) throw srsError;
      if (!srsRows || srsRows.length === 0) {
        setDueCards([]);
        setLoading(false);
        return;
      }

      const relevantItemIds = [...new Set(srsRows.map((r) => r.item_id))];
      const { data: libraryItems, error: libError } = await supabase
        .from('user_library_items')
        .select('id, flashcards_json')
        .in('id', relevantItemIds);

      if (libError) throw libError;

      const flashcardsMap: Record<string, Flashcard[]> = {};
      (libraryItems || []).forEach((item) => {
        flashcardsMap[item.id] = Array.isArray(item.flashcards_json) ? item.flashcards_json : [];
      });

      const cards: DueCard[] = [];
      srsRows.forEach((row) => {
        const deck = flashcardsMap[row.item_id];
        if (!deck) return;
        const card = deck[row.flashcard_index];
        if (!card) return;
        cards.push({
          itemId: row.item_id,
          flashcardIndex: row.flashcard_index,
          front: card.front,
          back: card.back,
          srsState: {
            easinessFactor: Number(row.easiness_factor),
            interval: row.interval_days,
            repetitions: row.repetitions,
          },
        });
      });

      setDueCards(cards);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  }, [user, itemIds, showErrorToast]);

  useEffect(() => {
    loadDueCards();
  }, [loadDueCards]);

  const handleRate = async (ratingValue: SRSRating) => {
    if (!user || rating) return;
    setRating(true);

    const card = dueCards[currentIndex];
    const result = calculateSRS(ratingValue, card.srsState);

    try {
      const { error } = await supabase
        .from('srs_flashcard_state')
        .upsert(
          {
            user_id: user.id,
            item_id: card.itemId,
            flashcard_index: card.flashcardIndex,
            easiness_factor: result.easinessFactor,
            interval_days: result.interval,
            repetitions: result.repetitions,
            next_review_at: result.nextReviewAt.toISOString(),
            last_reviewed_at: new Date().toISOString(),
            last_rating: ratingValue,
          },
          { onConflict: 'user_id,item_id,flashcard_index' }
        );

      if (error) throw error;

      const next = currentIndex + 1;
      if (next >= dueCards.length) {
        setReviewing(false);
        setDueCards([]);
        setCurrentIndex(0);
      } else {
        setCurrentIndex(next);
      }
      setFlipped(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showErrorToast(msg);
    } finally {
      setRating(false);
    }
  };

  const ratingButtons: { key: SRSRating; color: string }[] = [
    { key: 'again', color: 'bg-red-500 hover:bg-red-600' },
    { key: 'hard', color: 'bg-orange-500 hover:bg-orange-600' },
    { key: 'good', color: 'bg-emerald-500 hover:bg-emerald-600' },
    { key: 'easy', color: 'bg-blue-500 hover:bg-blue-600' },
  ];

  if (loading) {
    return (
      <div className={`bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] p-6`}>
        <div className={`animate-pulse text-muted-ink dark:text-muted-ink-on-dark text-sm`}>
          {t('srs.loading') || 'Loading flashcards…'}
        </div>
      </div>
    );
  }

  if (!reviewing) {
    return (
      <div className={`bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] p-6`} dir={dir}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-[var(--s4-radius-card)] bg-accent-gold text-white`}>
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`font-semibold text-ink dark:text-ink-on-dark`}>
                {t('srs.title') || 'Spaced Repetition'}
              </h3>
              <p className={`text-sm text-muted-ink dark:text-muted-ink-on-dark`}>
                {dueCards.length > 0
                  ? t('srs.cards_due', { count: dueCards.length }) || `${dueCards.length} cards due`
                  : t('srs.no_cards_due') || 'No cards due for review'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dueCards.length > 0 && (
              <>
                <Badge variant="warning" size="sm">
                  {dueCards.length}
                </Badge>
                <button
                  type="button"
                  onClick={() => {
                    setReviewing(true);
                    setCurrentIndex(0);
                    setFlipped(false);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--s4-radius-card)] bg-accent-gold hover:bg-accent-gold-soft text-white text-sm font-medium`}
                >
                  <ChevronRight className="h-4 w-4" />
                  {t('srs.review_now') || 'Review Now'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const card = dueCards[currentIndex];

  return (
    <div className={`bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] p-6 space-y-6`} dir={dir}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className={`h-5 w-5 text-secondary-ink dark:text-muted-ink-on-dark`} />
          <span className={`text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark`}>
            {currentIndex + 1} / {dueCards.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setReviewing(false);
            setFlipped(false);
          }}
          className={`text-sm text-muted-ink dark:text-muted-ink-on-dark hover:underline`}
        >
          {t('srs.exit_review') || 'Exit'}
        </button>
      </div>

      {/* Flip card */}
      <div className="perspective-1000">
        <div
          onClick={() => setFlipped((prev) => !prev)}
          className={`relative cursor-pointer rounded-[var(--s4-radius-card)] border border-divider dark:border-divider-on-dark bg-page-light dark:bg-page-dark min-h-[200px] flex items-center justify-center p-8 transition-transform duration-[var(--s4-dur-slow)]`}
          style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex items-center justify-center p-8 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className={`text-lg text-center text-ink dark:text-ink-on-dark`}>{card.front}</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center p-8 backface-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className={`text-lg text-center text-ink dark:text-ink-on-dark`}>{card.back}</p>
          </div>
        </div>

        {!flipped && (
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--s4-radius-card)] bg-accent-gold-soft/20 text-secondary-ink dark:text-muted-ink-on-dark text-sm`}
          >
            <RotateCcw className="h-4 w-4" />
            {t('srs.show_answer') || 'Show Answer'}
          </button>
        )}
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {ratingButtons.map((btn) => (
            <button
              key={btn.key}
              type="button"
              disabled={rating}
              onClick={() => handleRate(btn.key)}
              className={`px-3 py-2 rounded-[var(--s4-radius-card)] text-ink-on-dark text-sm font-medium ${btn.color} disabled:opacity-50`}
            >
              {t(`srs.${btn.key}`) || btn.key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
