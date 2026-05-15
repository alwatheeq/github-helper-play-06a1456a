import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Headphones, BookMarked, Network } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useChatContext } from '../../contexts/ChatContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { supabase } from '../../lib/supabase';
import { BookModeViewer } from './BookMode/BookModeViewer';

const MindMapView = React.lazy(() => import('./MindMap/MindMapView'));

type ViewSource = 'history' | 'library';

// Scholar v4 content view tabs
type ContentTab = 'read' | 'book' | 'audio' | 'mindmap';

interface HistoryData {
  id: string;
  summary_text: string;
  flashcards_json: Array<{ front: string; back: string }>;
  original_text_content?: string;
  topics?: string[];
  original_file_name?: string;
}

interface LibraryData {
  id: string;
  title: string;
  summary_text: string;
  flashcards_json: Array<{ front: string; back: string }>;
  original_text_content?: string;
  topics?: string[];
  user_id: string;
}

export const ContentViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { setChatContext, clearChatContext } = useChatContext();
  const { preferences } = useUserPreferences();

  const pathname = location.pathname || '';
  const source: ViewSource = pathname.startsWith('/view/history') ? 'history' : 'library';

  // Scholar v4: active tab state
  const [activeTab, setActiveTab] = useState<ContentTab>('read');

  // Redirect history view to Dashboard for full experience (sidebar, action bar)
  useEffect(() => {
    if (source === 'history' && id && user) {
      navigate('/', { state: { loadHistoryId: id }, replace: true });
    }
  }, [source, id, user, navigate]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HistoryData | LibraryData | null>(null);

  useEffect(() => {
    if (!id || !user) {
      if (!user) {
        setError('Unauthorized');
      } else {
        setError('Not found');
      }
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        if (source === 'history') {
          const { data: row, error: fetchError } = await supabase
            .from('user_history')
            .select('id, summary_text, flashcards_json, original_text_content, topics, original_file_name')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

          if (cancelled) return;
          if (fetchError || !row) {
            setError(row ? 'Not found' : fetchError?.message || 'Not found');
            setLoading(false);
            return;
          }
          setData(row as HistoryData);
        } else {
          const { data: row, error: fetchError } = await supabase
            .from('user_library_items')
            .select('id, title, summary_text, flashcards_json, original_text_content, topics, user_id')
            .eq('id', id)
            .single();

          if (cancelled) return;
          if (fetchError || !row) {
            setError(row ? 'Not found' : fetchError?.message || 'Not found');
            setLoading(false);
            return;
          }
          const lib = row as LibraryData;
          setData(lib);

          // Update last_viewed_at for owner (non-blocking)
          if (lib.user_id === user.id) {
            supabase
              .from('user_library_items')
              .update({ last_viewed_at: new Date().toISOString() })
              .eq('id', id)
              .eq('user_id', user.id)
              .then(() => {});
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- user object reference changes frequently; user.id is the stable dependency
  }, [id, user?.id, source]);

  // Set chat context when data is loaded; clear on unmount
  useEffect(() => {
    if (!data) return;
    const isHistory = source === 'history';
    const hist = isHistory ? (data as HistoryData) : null;
    const lib = !isHistory ? (data as LibraryData) : null;
    const fileName = hist?.original_file_name ?? lib?.title ?? '';
    const isMedical = fileName.toLowerCase().includes('medical') ||
      (data.topics?.some(topic => ['cardiology', 'neurology', 'medicine', 'clinical'].some(med => topic.toLowerCase().includes(med))) ?? false);
    setChatContext({
      summaryText: data.summary_text || '',
      originalText: data.original_text_content || '',
      topics: data.topics || [],
      medicalMode: isMedical,
      contextType: isHistory ? 'history_item' : 'library_item',
      contextId: data.id,
    });
    return () => clearChatContext();
  }, [data, source, setChatContext, clearChatContext]);

  const goBack = () => {
    navigate('/', { state: { tab: source } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-page-light dark:bg-page-dark">
        <div className="text-lg text-secondary-ink dark:text-muted-ink-on-dark">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4 bg-page-light dark:bg-page-dark">
        <p className="text-lg text-secondary-ink dark:text-muted-ink-on-dark">
          {error === 'Unauthorized'
            ? 'Please sign in to view this content.'
            : 'Content not found or you do not have access.'}
        </p>
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-2 px-4 py-2 rounded-[12px] border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="h-5 w-5" />
          Go back
        </button>
      </div>
    );
  }

  const isMedical = (data as HistoryData).original_file_name?.toLowerCase().includes('medical') ||
    (data.topics?.some(topic => ['cardiology', 'neurology', 'medicine', 'clinical'].some(med => topic.toLowerCase().includes(med))) ?? false);

  const title = (data as LibraryData).title ?? (data as HistoryData).original_file_name ?? 'Content';

  // Scholar v4 tab definitions
  const tabs: { id: ContentTab; label: string; icon: React.ReactNode }[] = [
    { id: 'read',    label: 'Read',      icon: <BookOpen className="h-4 w-4" /> },
    { id: 'book',    label: 'Book Mode', icon: <BookMarked className="h-4 w-4" /> },
    { id: 'audio',   label: 'Audio',     icon: <Headphones className="h-4 w-4" /> },
    { id: 'mindmap', label: 'Mind Map',  icon: <Network className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-page-light dark:bg-page-dark">
      {/* Scholar v4: single 52px dark bar — back | sep | title | pill tabs */}
      <div className="sticky top-0 z-30 bg-sidebar flex items-center h-[52px] px-[18px] gap-[14px]">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 text-muted-ink-on-dark hover:text-ink-on-dark transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-[13px]">Back</span>
        </button>
        <div className="w-px h-4 bg-white/20 flex-shrink-0" />
        <h1 className="font-display text-[13px] font-semibold text-ink-on-dark truncate flex-1">
          {title}
        </h1>
        <div className="flex gap-0.5 bg-white/[0.07] rounded-[8px] p-[3px] flex-shrink-0" role="tablist" aria-label="Content view modes">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex items-center gap-1 px-[14px] py-[5px] rounded-[6px] text-[12px] font-semibold whitespace-nowrap transition-colors duration-150',
                  active ? 'bg-accent-gold text-sidebar' : 'text-muted-ink-on-dark hover:text-ink-on-dark',
                ].join(' ')}
              >
                <span aria-hidden>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {/* Read tab — centered article prose */}
        {activeTab === 'read' && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-[700px] mx-auto px-6 py-10">
              {/* Topics */}
              {data.topics && data.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {data.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-accent-gold-soft text-accent-gold"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Article heading in font-display */}
              <h2 className="font-display text-3xl text-ink dark:text-ink-on-dark mb-6 leading-snug">
                {title}
              </h2>

              {/* Body text — prose */}
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                {data.summary_text.split('\n').filter(Boolean).map((paragraph, i) => (
                  <p key={i} className="text-ink dark:text-ink-on-dark leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Flashcard count info */}
              {data.flashcards_json.length > 0 && (
                <div className="mt-8 pt-6 border-t border-divider dark:border-divider-on-dark">
                  <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
                    {data.flashcards_json.length} flashcard{data.flashcards_json.length !== 1 ? 's' : ''} generated from this document.{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('book')}
                      className="text-accent-gold hover:opacity-80 font-medium underline underline-offset-2"
                    >
                      Open Book Mode
                    </button>{' '}
                    to study them.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Book Mode tab */}
        {activeTab === 'book' && (
          <BookModeViewer
            summaryId={source === 'library' ? data.id : null}
            summaryText={data.summary_text}
            flashcards={data.flashcards_json || []}
            originalText={data.original_text_content || ''}
            topics={data.topics || []}
            source={source}
            onClose={goBack}
            medicalMode={isMedical}
            freeFormMode={preferences?.free_form_mode_enabled ?? false}
          />
        )}

        {/* Audio tab — waveform placeholder + playback controls */}
        {activeTab === 'audio' && (
          <div className="h-full overflow-y-auto flex flex-col">
            {/* Compact player bar */}
            <div className="flex-shrink-0 bg-card-light dark:bg-card-dark border-b border-divider dark:border-divider-on-dark px-6 py-4 flex items-center gap-4">
              {/* Play button */}
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity"
                aria-label="Play"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </button>

              {/* Progress track */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-xs font-medium text-ink dark:text-ink-on-dark truncate">{title}</span>
                  <span className="text-xs text-muted-ink dark:text-muted-ink-on-dark font-mono flex-shrink-0 ml-3">0:00 / —:——</span>
                </div>
                {/* Waveform placeholder */}
                <div className="h-8 bg-subtle dark:bg-subtle-on-dark overflow-hidden relative flex items-end gap-px px-1">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-divider dark:bg-divider-on-dark opacity-60"
                      style={{ height: `${20 + Math.sin(i * 0.4) * 12 + Math.cos(i * 0.7) * 8}px` }}
                    />
                  ))}
                  {/* playhead */}
                  <div className="absolute top-0 bottom-0 left-[28%] w-px bg-accent-gold" />
                </div>
              </div>

              {/* Skip controls */}
              <div className="flex gap-2 flex-shrink-0">
                <button type="button" className="px-2.5 py-1 text-xs border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark hover:bg-subtle transition-colors">
                  ⏮ 15s
                </button>
                <button type="button" className="px-2.5 py-1 text-xs border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark hover:bg-subtle transition-colors">
                  15s ⏭
                </button>
              </div>

              {/* Speed */}
              <div className="flex gap-1 flex-shrink-0">
                {['0.75×', '1×', '1.25×', '1.5×'].map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    className={`px-2 py-1 text-xs font-semibold border transition-colors ${
                      i === 1
                        ? 'bg-chip dark:bg-card-dark border-accent-gold text-accent-gold'
                        : 'border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark hover:bg-subtle'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Transcript placeholder */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <p className="text-xs font-bold tracking-[2px] uppercase text-accent-gold mb-6">Transcript</p>
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-start gap-4 text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                  <Headphones className="h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Audio narration for this document is being generated. Once ready, you will see a full transcript with timestamps here, synchronized with the audio playback.
                  </p>
                </div>

                {/* Show summary paragraphs as transcript preview */}
                {data.summary_text.split('\n').filter(Boolean).slice(0, 4).map((paragraph, i) => (
                  <div key={i} className="flex gap-4 pl-2 border-l-2 border-transparent hover:border-accent-gold transition-colors">
                    <span className="text-xs text-accent-gold font-bold font-mono flex-shrink-0 pt-0.5 min-w-[2.5rem]">
                      {String(i * 45).padStart(1, '0')}:{String((i * 7) % 60).padStart(2, '0')}
                    </span>
                    <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark leading-relaxed">
                      {paragraph}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mind Map tab — Scholar v4 ContentViewMindMap4 design */}
        {activeTab === 'mindmap' && (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Hint bar */}
            <div className="flex-shrink-0 bg-card-light dark:bg-card-dark border-b border-divider dark:border-divider-on-dark px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-ink dark:text-muted-ink-on-dark">
                <span className="px-2 py-0.5 text-xs font-semibold bg-chip dark:bg-card-dark border border-divider dark:border-divider-on-dark text-accent-gold">
                  AI Generated
                </span>
                Concept map based on your document · Drag to pan · Scroll to zoom
              </div>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-semibold bg-accent-gold text-ink-on-dark hover:opacity-90 transition-opacity"
              >
                ↺ Regenerate
              </button>
            </div>

            {/* Mind map canvas */}
            <div className="flex-1 overflow-hidden relative bg-page-light dark:bg-page-dark"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            >
              <Suspense fallback={
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="animate-spin h-8 w-8 border-2 border-accent-gold border-t-transparent rounded-full" />
                  <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
                    Mind map is being generated...
                  </p>
                </div>
              }>
                {source === 'library' ? (
                  <MindMapView text={data.summary_text} title={title} />
                ) : (
                  /* History items: show skeleton node graph */
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="w-12 h-12 bg-chip dark:bg-card-dark border border-divider dark:border-divider-on-dark flex items-center justify-center">
                        <Network className="h-6 w-6 text-accent-gold" />
                      </div>
                      <h3 className="font-display text-xl text-ink dark:text-ink-on-dark">
                        Mind map is being generated...
                      </h3>
                      <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark max-w-sm">
                        Save this document to your library to enable the full interactive mind map experience.
                      </p>
                    </div>

                    {/* Skeleton node graph */}
                    <div className="relative w-full max-w-lg h-48 opacity-30">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 440 180" fill="none">
                        <line x1="220" y1="30" x2="80" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5,3" className="text-accent-gold" />
                        <line x1="220" y1="30" x2="220" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5,3" className="text-accent-gold" />
                        <line x1="220" y1="30" x2="360" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5,3" className="text-accent-gold" />
                        <line x1="80" y1="100" x2="40" y2="155" stroke="currentColor" strokeWidth="1" strokeDasharray="4,3" className="text-divider" />
                        <line x1="80" y1="100" x2="120" y2="155" stroke="currentColor" strokeWidth="1" strokeDasharray="4,3" className="text-divider" />
                        <rect x="165" y="10" width="110" height="36" rx="10" fill="currentColor" className="text-accent-gold" />
                        <rect x="30" y="82" width="100" height="32" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-gold" />
                        <rect x="168" y="82" width="104" height="32" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-gold" />
                        <rect x="310" y="82" width="100" height="32" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-gold" />
                        <rect x="10" y="140" width="70" height="26" rx="6" fill="none" stroke="currentColor" strokeWidth="1" className="text-divider" />
                        <rect x="90" y="140" width="70" height="26" rx="6" fill="none" stroke="currentColor" strokeWidth="1" className="text-divider" />
                      </svg>
                    </div>
                  </div>
                )}
              </Suspense>

              {/* Zoom controls — Scholar v4 style */}
              <div className="absolute bottom-5 left-5 flex flex-col gap-1.5 z-10">
                {['+', '−'].map((sym, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-8 h-8 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark flex items-center justify-center text-base text-secondary-ink dark:text-muted-ink-on-dark hover:bg-subtle transition-colors "
                  >
                    {sym}
                  </button>
                ))}
                <button
                  type="button"
                  className="w-8 h-8 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark flex items-center justify-center text-[9px] font-bold text-muted-ink dark:text-muted-ink-on-dark hover:bg-subtle transition-colors "
                >
                  FIT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
