import React, { useCallback, useEffect, useState } from 'react';
import { Brain, ChevronRight } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../Toast/Toast';
import { supabase } from '../../../lib/supabase';
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

  const ratingButtons: { key: SRSRating; color: string; label: string; sub: string }[] = [
    { key: 'again', color: 'bg-red-500 hover:bg-red-600', label: t('srs.again') || 'Again', sub: t('srs.again_sub') || 'Forgot completely' },
    { key: 'hard', color: 'bg-orange-500 hover:bg-orange-600', label: t('srs.hard') || 'Hard', sub: t('srs.hard_sub') || 'Recalled with effort' },
    { key: 'good', color: 'bg-emerald-500 hover:bg-emerald-600', label: t('srs.good') || 'Good', sub: t('srs.good_sub') || 'Recalled correctly' },
    { key: 'easy', color: 'bg-blue-500 hover:bg-blue-600', label: t('srs.easy') || 'Easy', sub: t('srs.easy_sub') || 'Recalled instantly' },
  ];

  const progressPct = dueCards.length > 0
    ? Math.round((currentIndex / dueCards.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
        <div className="animate-pulse text-muted-ink dark:text-muted-ink-on-dark text-sm">
          {t('srs.loading') || 'Loading flashcards…'}
        </div>
      </div>
    );
  }

  if (!reviewing) {
    return (
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6" dir={dir}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-gold text-ink-on-dark">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-ink dark:text-ink-on-dark">
                {t('srs.title') || 'Spaced Repetition'}
              </h3>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
                {dueCards.length > 0
                  ? t('srs.cards_due', { count: dueCards.length }) || `${dueCards.length} cards due`
                  : t('srs.no_cards_due') || 'No cards due for review'}
              </p>
            </div>
          </div>

          {dueCards.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setReviewing(true);
                setCurrentIndex(0);
                setFlipped(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold text-ink-on-dark text-sm font-medium hover:opacity-90"
            >
              <ChevronRight className="h-4 w-4" />
              {t('srs.review_now') || 'Review Now'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const card = dueCards[currentIndex];

  return (
    /* Aca4SRS: large centered flip card */
    <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6 space-y-5" dir={dir}>
      {/* Progress row */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-[6px] rounded-[3px] bg-chip dark:bg-card-dark overflow-hidden">
          <div
            className="h-full rounded-[3px] bg-accent-gold transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-muted-ink dark:text-muted-ink-on-dark whitespace-nowrap">
          {currentIndex + 1} / {dueCards.length}
        </span>
        <button
          type="button"
          onClick={() => { setReviewing(false); setFlipped(false); }}
          className="text-xs text-muted-ink dark:text-muted-ink-on-dark hover:underline"
        >
          {t('srs.exit_review') || 'Exit Review'}
        </button>
      </div>

      {/* Large flip card — min-h-64 per Aca4SRS */}
      <div
        className="relative cursor-pointer border-2 rounded-[14px] overflow-hidden"
        style={{ minHeight: '16rem', borderColor: 'var(--accent-gold)' }}
        onClick={() => setFlipped((p) => !p)}
      >
        {/* Front face */}
        <div className={`transition-opacity duration-300 ${flipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="bg-accent-gold/10 px-6 py-5 border-b border-divider dark:border-divider-on-dark">
            <p className="text-xs font-bold text-accent-gold uppercase tracking-widest mb-3">
              {t('srs.question_label') || 'Question'}
            </p>
            <p className="font-display text-lg font-semibold text-ink dark:text-ink-on-dark leading-snug">
              {card.front}
            </p>
          </div>
          <div className="px-6 py-4 flex items-center justify-center">
            <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
              {t('srs.tap_to_reveal') || 'Tap to reveal answer'}
            </p>
          </div>
        </div>

        {/* Back face */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="bg-accent-gold/10 px-6 py-5 border-b border-divider dark:border-divider-on-dark">
            <p className="text-xs font-bold text-accent-gold uppercase tracking-widest mb-3">
              {t('srs.question_label') || 'Question'}
            </p>
            <p className="font-display text-lg font-semibold text-ink dark:text-ink-on-dark leading-snug">
              {card.front}
            </p>
          </div>
          <div className="px-6 py-5 bg-card-light dark:bg-card-dark">
            <p className="text-xs font-bold text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-widest mb-3">
              {t('srs.answer_label') || 'Answer'}
            </p>
            <p className="text-base text-ink dark:text-ink-on-dark leading-relaxed">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      {/* Rating buttons — shown only when flipped */}
      {flipped ? (
        <div>
          <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mb-3">
            {t('srs.rate_prompt') || 'How well did you know this?'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ratingButtons.map((btn) => (
              <button
                key={btn.key}
                type="button"
                disabled={rating}
                onClick={() => handleRate(btn.key)}
                className={`py-3 px-2 rounded-[10px] text-white text-center ${btn.color} disabled:opacity-50 transition-opacity`}
              >
                <p className="text-sm font-bold">{btn.label}</p>
                <p className="text-[10px] opacity-85 mt-0.5">{btn.sub}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Tap-to-reveal button shortcut */
        <button
          type="button"
          onClick={() => setFlipped(true)}
          className="w-full py-2.5 border border-accent-gold/40 text-sm text-accent-gold font-medium hover:bg-accent-gold/10 transition-colors"
        >
          {t('srs.show_answer') || 'Show Answer'}
        </button>
      )}
    </div>
  );
};
