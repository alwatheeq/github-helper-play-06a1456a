import React from 'react';
import { FileText, RefreshCw, Copy, Check, BookOpen, FileSearch, X, Download, Folder, Tag, Plus, AlertCircle, Stethoscope, GraduationCap, Activity, Globe, Lock, Brain } from 'lucide-react';
// html2pdf.js is dynamically imported on demand to keep it out of the initial bundle.
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../contexts/I18nContext';
import { PREDEFINED_TOPICS } from '../../utils/config';
import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { useChatContext } from '../../contexts/ChatContext';
import { FreeFormToggle } from './BookMode/FreeFormToggle';
import { BookModeViewer } from './BookMode/BookModeViewer';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { ReadAloudButton } from './ReadAloud/ReadAloudButton';
import { sanitizeForTts } from './ReadAloud/readAloudUtils';
import HighlightLayer from './Highlighting/HighlightLayer';
import { Modal } from '../Common/Modal';
const MindMapView = React.lazy(() => import('./MindMap/MindMapView'));

interface SummaryDisplayProps {
  summaryChunks: string[];
  flashcards: Array<{ front: string; back: string }>;
  originalText: string;
  topics?: string[];
  medicalMode?: boolean;
  medicalScore?: number;
  onPublishToLibrary: (summary: string, flashcards: Array<{ front: string; back: string }>, originalText: string) => Promise<boolean>;
  onReset: () => void;
  isSharedView?: boolean;
  hideNewDocumentButton?: boolean;
  /** Library item id (`user_library_items.id`) so highlights persist for this document. */
  highlightLibraryItemId?: string;
  onActionBarData?: (data: {
    freeFormMode: boolean;
    onFreeFormToggle: (enabled: boolean) => void;
    combinedSummary: string;
    copiedIndex: number | null;
    publishing: boolean;
    published: boolean;
    onCopyAll: () => void;
    onDualMode: () => void;
    onExportTxt: () => void;
    onExportPdf: () => void;
    onPublish: () => void;
    onNewDocument: () => void;
  }) => void;
}

interface UserFolder {
  id: string;
  name: string;
}

interface UserTag {
  id: string;
  name: string;
  is_public?: boolean;
  user_id?: string;
}
export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ 
  summaryChunks, 
  flashcards, 
  originalText,
  topics = [],
  medicalMode = false,
  medicalScore,
  onPublishToLibrary: _onPublishToLibrary,
  onReset,
  isSharedView = false,
  hideNewDocumentButton = false,
  highlightLibraryItemId,
  onActionBarData
}) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const { setChatContext, clearChatContext } = useChatContext();
  const { preferences: _preferences, loading: preferencesLoading, updateFreeFormMode } = useUserPreferences();
  const [freeFormMode, setFreeFormMode] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [publishing, setPublishing] = React.useState(false);
  const [published, setPublished] = React.useState(false);
  const [mindMapOpen, setMindMapOpen] = React.useState(false);
  /** Set after publishing from this session so highlights/book mode use the real library id. */
  const [persistedLibraryItemId, setPersistedLibraryItemId] = React.useState<string | undefined>(undefined);
  const effectiveLibraryItemId = highlightLibraryItemId ?? persistedLibraryItemId;
  const [showOriginalText, setShowOriginalText] = React.useState(false);

  React.useEffect(() => {
    if (summaryChunks.length === 0) {
      setPersistedLibraryItemId(undefined);
    }
  }, [summaryChunks.length]);
  const [showPublishModal, setShowPublishModal] = React.useState(false);
  const [folders, setFolders] = React.useState<UserFolder[]>([]);
  const [tags, setTags] = React.useState<UserTag[]>([]);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);
  const [selectedPredefinedTopics, setSelectedPredefinedTopics] = React.useState<string[]>([]);
  const [newTagName, setNewTagName] = React.useState('');
  const [showCreateTag, setShowCreateTag] = React.useState(false);
  const [showCreateFolderInput, setShowCreateFolderInput] = React.useState(false);
  const [newFolderNameInput, setNewFolderNameInput] = React.useState('');
  const [creatingFolder, setCreatingFolder] = React.useState(false);

  // Always start with book mode (freeFormMode = false) for new summaries
  // User preference only affects toggle availability, not initial state
  // This ensures new summaries always start in book mode regardless of user preference

  // Save free-form mode preference
  const handleFreeFormToggle = React.useCallback(async (enabled: boolean) => {
    setFreeFormMode(enabled);
    if (user) {
      try {
        await updateFreeFormMode(enabled);
      } catch (error) {
        // Silently fail - preference will be saved on next successful update
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), {
          component: 'SummaryDisplay',
          action: 'handleFreeFormToggle',
          userId: user.id,
          metadata: { enabled }
        });
      }
    }
  }, [user, updateFreeFormMode]);

  // Calculate combined summary
  const combinedSummary = React.useMemo(() => summaryChunks.join('\n\n'), [summaryChunks]);

  // Set chat context when summary is displayed
  React.useEffect(() => {
    if (summaryChunks.length > 0 && !isSharedView) {
      setChatContext({
        summaryText: combinedSummary,
        originalText: originalText,
        topics: topics || [],
        medicalMode: medicalMode || false,
        contextType: 'summary',
        contextId: null,
      });
    } else {
      clearChatContext();
    }

    // Clear context when component unmounts
    return () => {
      clearChatContext();
    };
  }, [summaryChunks.length, combinedSummary, originalText, topics, medicalMode, isSharedView, setChatContext, clearChatContext]);

  const fetchFolders = React.useCallback(async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_folders')
        .select('id, name')
        .order('name');

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'SummaryDisplay', 
          action: 'fetchFolders'
        });
        ErrorLogger.error(error, { 
          component: 'SummaryDisplay', 
          action: 'fetchFolders',
          userId: user.id
        });
        showErrorToast(message);
        return;
      }

      setFolders(data || []);
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'SummaryDisplay', 
        action: 'fetchFolders'
      });
      ErrorLogger.error(error, { 
        component: 'SummaryDisplay', 
        action: 'fetchFolders',
        userId: user.id
      });
      showErrorToast(message);
    }
  }, [user, showErrorToast]);

  const fetchTags = React.useCallback(async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, is_public, user_id')
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order('is_public', { ascending: false })
        .order('name');

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'SummaryDisplay', 
          action: 'fetchTags'
        });
        ErrorLogger.error(error, { 
          component: 'SummaryDisplay', 
          action: 'fetchTags',
          userId: user.id
        });
        showErrorToast(message);
        return;
      }

      setTags(data || []);
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'SummaryDisplay', 
        action: 'fetchTags'
      });
      ErrorLogger.error(error, { 
        component: 'SummaryDisplay', 
        action: 'fetchTags',
        userId: user.id
      });
      showErrorToast(message);
    }
  }, [user, showErrorToast]);

  React.useEffect(() => {
    if (showPublishModal && user) {
      void fetchFolders();
      void fetchTags();
    }
  }, [showPublishModal, user, fetchFolders, fetchTags]);

  const createTag = async () => {
    if (!user || !newTagName.trim()) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({
          user_id: user.id,
          name: newTagName.trim(),
          is_public: true
        })
        .select()
        .single();

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'SummaryDisplay', 
          action: 'createTag',
          tagName: newTagName.trim()
        });
        ErrorLogger.error(error, { 
          component: 'SummaryDisplay', 
          action: 'createTag',
          tagName: newTagName.trim(),
          userId: user.id
        });
        showErrorToast(message);
        return;
      }

      setTags(prev => [...prev, data]);
      setSelectedTagIds(prev => [...prev, data.id]);
      setNewTagName('');
      setShowCreateTag(false);
      showSuccessToast(t('publish_modal.tag_created_success') || 'Tag created successfully');
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'SummaryDisplay', 
        action: 'createTag'
      });
      ErrorLogger.error(error, { 
        component: 'SummaryDisplay', 
        action: 'createTag',
        userId: user.id
      });
      showErrorToast(message);
    }
  };

  const copyToClipboard = React.useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      ErrorLogger.error(err, { 
        component: 'SummaryDisplay', 
        action: 'copyToClipboard',
        index
      });
      showErrorToast('Failed to copy to clipboard');
    }
  }, [showErrorToast]);

  const handlePublishToLibrary = async (folderId?: string, tagIds?: string[]) => {
    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    setPublishing(true);
    try {
      // Process predefined topics - create tags if they don't exist
      const finalTagIds = [...(tagIds || [])];
      
      for (const topicName of selectedPredefinedTopics) {
        // Check if tag already exists
        const existingTag = tags.find(tag => tag.name.toLowerCase() === topicName.toLowerCase());
        
        if (existingTag) {
          if (!finalTagIds.includes(existingTag.id)) {
            finalTagIds.push(existingTag.id);
          }
        } else {
          // Create new tag
          try {
            const { data: newTag, error: createError } = await supabase
              .from('tags')
              .insert({
                user_id: user!.id,
                name: topicName
              })
              .select()
              .single();

            if (createError) {
              ErrorLogger.error(createError, { 
                component: 'SummaryDisplay', 
                action: 'handlePublishToLibrary',
                step: 'createTopicTag',
                topicName,
                userId: user!.id
              });
              // Non-blocking: continue even if tag creation fails
            } else {
              finalTagIds.push(newTag.id);
              // Update local tags state
              setTags(prev => [...prev, newTag]);
            }
          } catch (tagError) {
            ErrorLogger.error(tagError, { 
              component: 'SummaryDisplay', 
              action: 'handlePublishToLibrary',
              step: 'createTopicTag',
              topicName,
              userId: user!.id
            });
            // Non-blocking: continue even if tag creation fails
          }
        }
      }
      
      // First publish to library
      const result = await publishToLibraryWithMetadata(combinedSummary, flashcards, originalText, folderId, finalTagIds);
      if (result.success) {
        setPublished(true);
        setShowPublishModal(false);
        showSuccessToast('Item published to library successfully!');
        setTimeout(() => setPublished(false), 3000);
        if (result.itemId) {
          setPersistedLibraryItemId(result.itemId);
        }

        // Trigger library refresh event with item ID
        window.dispatchEvent(new CustomEvent('libraryItemPublished', {
          detail: { 
            id: result.itemId,
            folderId, 
            tagIds: finalTagIds, 
            timestamp: Date.now() 
          }
        }));
      }
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'SummaryDisplay', 
        action: 'handlePublishToLibrary'
      });
      ErrorLogger.error(error, { 
        component: 'SummaryDisplay', 
        action: 'handlePublishToLibrary',
        userId: user?.id
      });
      showErrorToast(message);
    } finally {
      setPublishing(false);
    }
  };

  // Hash function to create unique key for summary text (matches NotesWidget)
  const hashSummaryText = (text: string): string => {
    const preview = text.substring(0, 50).replace(/\s+/g, '');
    const length = text.length;
    const firstWord = text.split(/\s+/)[0] || '';
    return `${preview}_${length}_${firstWord}`.substring(0, 50);
  };

  // Get localStorage key for temporary notes
  const getTempNotesKey = (summaryText: string): string => {
    return `temp_notes_${hashSummaryText(summaryText)}`;
  };

  // Migrate temporary notes from localStorage to database
  const migrateTempNotesToDatabase = async (summaryText: string, newSummaryId: string) => {
    if (!user) return;

    try {
      const tempNotesKey = getTempNotesKey(summaryText);
      const storedNotes = localStorage.getItem(tempNotesKey);
      
      if (!storedNotes) {
        // No temporary notes to migrate
        return;
      }

      const tempNotes: Array<{
        id: string;
        content: string;
        note_type: 'page' | 'book';
        page_index: number | null;
        created_at: string;
        updated_at: string;
      }> = JSON.parse(storedNotes);

      if (tempNotes.length === 0) {
        // No notes to migrate
        return;
      }

      // Insert all temporary notes into database
      const notesToInsert = tempNotes.map(note => ({
        user_id: user.id,
        summary_id: newSummaryId,
        content: note.content,
        note_type: note.note_type,
        page_index: note.page_index,
        created_at: note.created_at,
        updated_at: note.updated_at
      }));

      const { error } = await supabase
        .from('summary_notes')
        .insert(notesToInsert);

      if (error) {
        ErrorLogger.error(error, {
          component: 'SummaryDisplay',
          action: 'migrateTempNotesToDatabase',
          userId: user.id,
          metadata: { summaryId: newSummaryId, noteCount: tempNotes.length }
        });
        // Don't fail the entire operation if migration fails
        // Notes will remain in localStorage and can be migrated later
      } else {
        // Clear temporary notes from localStorage after successful migration
        localStorage.removeItem(tempNotesKey);
        if (tempNotes.length > 0) {
          showSuccessToast(`Migrated ${tempNotes.length} note${tempNotes.length > 1 ? 's' : ''} to library`);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, {
        component: 'SummaryDisplay',
        action: 'migrateTempNotesToDatabase',
        userId: user?.id,
        metadata: { summaryId: newSummaryId }
      });
      // Don't fail the entire operation if migration fails
    }
  };

  const publishToLibraryWithMetadata = async (
    summary: string,
    flashcards: Array<{ front: string; back: string }>,
    originalText: string,
    folderId?: string,
    tagIds?: string[]
  ): Promise<{ success: boolean; itemId?: string }> => {
    if (!user || !user.id) {
      showErrorToast('Please log in to publish to library');
      ErrorLogger.error(new Error('No authenticated user found'), { 
        component: 'SummaryDisplay', 
        action: 'publishToLibraryWithMetadata'
      });
      return { success: false };
    }

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return { success: false };
    }

    try {
      // Create a descriptive title with fallback
      let title = 'Generated Content';

      // Try to use translation, but have fallback
      try {
        const translatedTitle = t('common.generated_content');
        if (translatedTitle && translatedTitle !== 'common.generated_content') {
          title = translatedTitle;
        }
      } catch {
        // Translation key not found, using fallback - non-critical
      }

      // Create more descriptive title from summary
      if (summary && summary.trim().length > 0) {
        const summaryWords = summary.trim().split(' ').slice(0, 6).join(' ');
        const timestamp = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        title = `${summaryWords}... - ${timestamp}`;
      } else {
        // If no summary, create title from timestamp
        const timestamp = new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        title = `${title} - ${timestamp}`;
      }

      // Ensure title is never empty
      if (!title || title.trim().length === 0) {
        title = `Library Item ${Date.now()}`;
      }

      // Validate folder if provided
      if (folderId) {
        const { data: folderExists, error: folderError } = await supabase
          .from('user_folders')
          .select('id')
          .eq('id', folderId)
          .eq('user_id', user.id)
          .single();

        if (folderError || !folderExists) {
          ErrorLogger.error(folderError || new Error('Folder not found'), { 
            component: 'SummaryDisplay', 
            action: 'publishToLibraryWithMetadata',
            step: 'validateFolder',
            folderId,
            userId: user.id
          });
          folderId = undefined;
        }
      }

      const { data: libraryItem, error } = await supabase
        .from('user_library_items')
        .insert({
          user_id: user.id,
          title: title,
          summary_text: summary || '',
          flashcards_json: flashcards || [],
          source_type: 'processed',
          original_text_content: originalText || '',
          topics: topics || [],
          folder_id: folderId || null,
          is_public: true,
          shareable_link: crypto.randomUUID()
        })
        .select()
        .single();

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'SummaryDisplay', 
          action: 'publishToLibraryWithMetadata',
          step: 'insertLibraryItem',
          userId: user.id,
          folderId,
          tagCount: tagIds?.length || 0
        });
        ErrorLogger.error(error, { 
          component: 'SummaryDisplay', 
          action: 'publishToLibraryWithMetadata',
          step: 'insertLibraryItem',
          userId: user.id,
          folderId,
          tagCount: tagIds?.length || 0,
          errorCode: error.code,
          errorDetails: error.details,
          errorHint: error.hint
        });
        showErrorToast(message);
        return { success: false };
      }

      // Verify item was created
      if (!libraryItem || !libraryItem.id) {
        const errorMsg = 'Failed to publish: No item created';
        ErrorLogger.error(new Error(errorMsg), { 
          component: 'SummaryDisplay', 
          action: 'publishToLibraryWithMetadata',
          step: 'verifyItemCreated',
          userId: user.id
        });
        showErrorToast(errorMsg);
        return { success: false };
      }

      // Verify item is actually in database
      const { data: verifyItem, error: verifyError } = await supabase
        .from('user_library_items')
        .select('id, title, created_at')
        .eq('id', libraryItem.id)
        .single();

      if (verifyError || !verifyItem) {
        ErrorLogger.error(verifyError || new Error('Item verification failed'), { 
          component: 'SummaryDisplay', 
          action: 'publishToLibraryWithMetadata',
          step: 'verifyItemInDatabase',
          itemId: libraryItem.id,
          userId: user.id
        });
        showErrorToast('Item published but may not be visible. Please refresh the library page.');
        // Still return success with item ID since item was created
        return { success: true, itemId: libraryItem.id };
      }

      // Add tags if selected
      if (tagIds && tagIds.length > 0) {
        const tagInserts = tagIds.map(tagId => ({
          item_id: libraryItem.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('item_tags')
          .insert(tagInserts);

        if (tagError) {
          ErrorLogger.error(tagError, { 
            component: 'SummaryDisplay', 
            action: 'publishToLibraryWithMetadata',
            step: 'addTags',
            itemId: libraryItem.id,
            tagIds,
            userId: user.id
          });
          // Don't fail the entire operation if tags fail
        }
      }

      // Migrate temporary notes from localStorage to database
      await migrateTempNotesToDatabase(combinedSummary, libraryItem.id);

      return { success: true, itemId: libraryItem.id };
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'SummaryDisplay', 
        action: 'publishToLibraryWithMetadata',
        userId: user.id
      });
      ErrorLogger.error(error, { 
        component: 'SummaryDisplay', 
        action: 'publishToLibraryWithMetadata',
        userId: user.id
      });
      showErrorToast(message);
      return { success: false };
    }
  };

  const createFolderInPublishModal = async () => {
    if (!user || !newFolderNameInput.trim()) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      setCreatingFolder(true);
      const { data, error } = await supabase
        .from('user_folders')
        .insert({
          user_id: user.id,
          name: newFolderNameInput.trim()
        })
        .select()
        .single();

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'SummaryDisplay', 
          action: 'createFolderInPublishModal',
          folderName: newFolderNameInput.trim(),
          userId: user.id
        });
        ErrorLogger.error(error, { 
          component: 'SummaryDisplay', 
          action: 'createFolderInPublishModal',
          folderName: newFolderNameInput.trim(),
          userId: user.id
        });
        showErrorToast(message || t('publish_modal.failed_create_folder'));
        return;
      }

      // Update folders list and select the new folder
      setFolders(prev => [...prev, data]);
      setSelectedFolderId(data.id);
      setNewFolderNameInput('');
      setShowCreateFolderInput(false);
      showSuccessToast(t('publish_modal.folder_created_success'));
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'SummaryDisplay', 
        action: 'createFolderInPublishModal',
        userId: user.id
      });
      ErrorLogger.error(error, { 
        component: 'SummaryDisplay', 
        action: 'createFolderInPublishModal',
        userId: user.id
      });
      showErrorToast(message || t('publish_modal.failed_create_folder'));
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleShowPublishModal = React.useCallback(() => {
    setShowPublishModal(true);
    setSelectedFolderId('');
    setSelectedTagIds([]);
    setSelectedPredefinedTopics([]);
  }, []);

  const exportAsTxt = React.useCallback(() => {
    const content = `${t('summary.document_summary').toUpperCase()}\n${'='.repeat(50)}\n\n${combinedSummary}\n\n\n${t('common.flashcards').toUpperCase()}\n${'='.repeat(50)}\n\n${flashcards.map((card, index) => `${index + 1}. Q: ${card.front}\n   A: ${card.back}`).join('\n\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [t, combinedSummary, flashcards]);

  const exportAsPdf = React.useCallback(async () => {
    const questionLabel = t('flashcards.question');
    const answerLabel = t('flashcards.answer');
    
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">${t('summary.document_summary')}</h1>
        <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-left: 4px solid #2563eb;">
          <p style="white-space: pre-wrap;">${combinedSummary}</p>
        </div>
        
        <h2 style="color: #2563eb; margin-top: 30px;">${t('common.flashcards')}</h2>
        ${flashcards.map((card, index) => `
          <div style="margin: 15px 0; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #fff;">
            <div style="font-weight: bold; color: #1e40af; margin-bottom: 8px;">${questionLabel} ${index + 1}:</div>
            <div style="margin-bottom: 10px;">${card.front}</div>
            <div style="font-weight: bold; color: #059669; margin-bottom: 5px;">${answerLabel}:</div>
            <div>${card.back}</div>
          </div>
        `).join('')}
      </div>
    `;

    const opt = {
      margin: 1,
      filename: `summary-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    const { default: html2pdf } = await import('html2pdf.js');
    html2pdf().set(opt).from(element).save();
  }, [t, combinedSummary, flashcards]);

  // Always show BookModeViewer (notebook style) when summary exists, unless shared view
  // Must be before early return so hooks run on every render
  const shouldShowBookMode = !preferencesLoading && !isSharedView && summaryChunks.length > 0;

  // Expose action bar data to parent component (Dashboard)
  React.useEffect(() => {
    if (onActionBarData && shouldShowBookMode) {
      onActionBarData({
        freeFormMode,
        onFreeFormToggle: handleFreeFormToggle,
        combinedSummary,
        copiedIndex,
        publishing,
        published,
        onCopyAll: () => copyToClipboard(combinedSummary, -1),
        onDualMode: () => setShowOriginalText(true),
        onExportTxt: exportAsTxt,
        onExportPdf: exportAsPdf,
        onPublish: handleShowPublishModal,
        onNewDocument: onReset
      });
    }
  }, [onActionBarData, shouldShowBookMode, freeFormMode, combinedSummary, copiedIndex, publishing, published, handleFreeFormToggle, exportAsTxt, exportAsPdf, handleShowPublishModal, onReset, copyToClipboard, setShowOriginalText]);

  if (showOriginalText) {
    return (
      <div className="bg-card-light rounded-[var(--s4-radius-card)] border border-divider shadow-[var(--s4-shadow-card)]">
        {/* Header — Scholar v4 action bar style with border-l accent */}
        <div className="px-6 py-4 border-b border-divider border-l-[3px] border-l-accent-gold flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent-gold-soft p-2 border border-divider">
              <FileSearch className="h-4 w-4 text-accent-gold" />
            </div>
            <div>
              <h3 className="font-display text-[15px] font-semibold text-ink leading-tight">{t('summary.original_text')}</h3>
              <p className="text-[11px] text-muted-ink mt-0.5">{t('summary.full_extracted')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(originalText, -2)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] text-secondary-ink border border-divider hover:bg-subtle/60 transition-colors duration-[var(--s4-dur-fast)]"
            >
              {copiedIndex === -2 ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{t('summary.copy_text')}</span>
            </button>
            <button
              onClick={() => setShowOriginalText(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] text-muted-ink border border-divider hover:bg-subtle/60 transition-colors duration-[var(--s4-dur-fast)]"
            >
              <X className="h-3.5 w-3.5" />
              <span>{t('summary.back_to_summary')}</span>
            </button>
          </div>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="bg-subtle p-4">
            {originalText && originalText.trim() ? (
              <div className="text-secondary-ink text-sm leading-relaxed">
                <HighlightLayer text={originalText} itemId={effectiveLibraryItemId} />
              </div>
            ) : (
              <p className="text-muted-ink leading-relaxed whitespace-pre-wrap text-sm">
                {t('summary.no_original_text')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    {shouldShowBookMode ? (
      <div className="relative">
        {/* Action Bar removed - now rendered in Dashboard */}
        <BookModeViewer
          summaryId={effectiveLibraryItemId ?? null}
          summaryText={combinedSummary}
          flashcards={flashcards}
          originalText={originalText}
          topics={topics}
          source="dashboard"
          medicalMode={medicalMode}
          freeFormMode={freeFormMode}
        />
      </div>
    ) : (
      /* Scholar v4 Dash4Result style — clean card with editorial left-border accent on header */
      <div className="bg-card-light border border-divider shadow-[var(--s4-shadow-card)]">
        {/* Header row: title left, action buttons right */}
        <div className="px-6 py-4 border-b border-divider border-l-[3px] border-l-accent-gold flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {medicalMode ? (
                <Stethoscope className="h-4 w-4 text-red-600 flex-shrink-0" />
              ) : (
                <FileText className="h-4 w-4 text-accent-gold flex-shrink-0" />
              )}
              <h2 className="font-display text-[18px] font-semibold text-ink leading-tight tracking-tight">
                {medicalMode ? 'Clinical Summary' : t('summary.document_summary')}
              </h2>
            </div>
            <p className="text-[11px] text-muted-ink mt-0.5">
              {medicalMode ? (
                <>
                  {summaryChunks.length} clinical section{summaryChunks.length === 1 ? '' : 's'} processed
                  {medicalScore && <span className="ml-1.5">· Medical Score: {medicalScore}/100</span>}
                </>
              ) : (
                `${summaryChunks.length} ${summaryChunks.length === 1 ? t('summary.sections_processed') : t('summary.sections_processed_plural')}`
              )}
            </p>

            {/* Topics — minimal chip row */}
            {topics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {topics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[10px] font-medium bg-chip border border-divider text-secondary-ink"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action row — top-right (Dash4Result spec) */}
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            <button
              onClick={() => copyToClipboard(combinedSummary, -1)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-secondary-ink border border-divider hover:bg-subtle/60 transition-colors duration-[var(--s4-dur-fast)]"
            >
              {copiedIndex === -1 ? <Check className="h-3.5 w-3.5 text-accent-gold" /> : <Copy className="h-3.5 w-3.5" />}
              {t('summary.copy_all')}
            </button>

            <ReadAloudButton
              text={sanitizeForTts(combinedSummary)}
              ariaLabel={t('read_aloud.read_aloud') || 'Read summary aloud'}
            />

            <button
              type="button"
              onClick={() => setMindMapOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-secondary-ink border border-divider hover:bg-subtle/60 transition-colors duration-[var(--s4-dur-fast)]"
            >
              <Brain className="h-3.5 w-3.5" />
              {t('mind_map.title')}
            </button>

            <button
              onClick={() => setShowOriginalText(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-secondary-ink border border-divider hover:bg-subtle/60 transition-colors duration-[var(--s4-dur-fast)]"
              title={!originalText?.trim() ? t('summary.no_original_text_available') : t('summary.view_original_text')}
            >
              <FileSearch className="h-3.5 w-3.5" />
              {t('summary.dual_mode')}
            </button>

            <button
              type="button"
              onClick={exportAsTxt}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-secondary-ink border border-divider hover:bg-subtle/60 transition-colors duration-[var(--s4-dur-fast)]"
            >
              <Download className="h-3.5 w-3.5" />
              {t('summary.export_txt')}
            </button>

            <button
              type="button"
              onClick={exportAsPdf}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-secondary-ink border border-divider hover:bg-subtle/60 transition-colors duration-[var(--s4-dur-fast)]"
            >
              <Download className="h-3.5 w-3.5" />
              {t('summary.export_pdf')}
            </button>

            {!isSharedView && (
              <button
                onClick={handleShowPublishModal}
                disabled={publishing || published}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition-colors duration-[var(--s4-dur-fast)] disabled:opacity-60 ${
                  published
                    ? 'bg-subtle border border-divider text-accent-gold'
                    : medicalMode
                      ? 'bg-red-600 text-white hover:bg-red-700 border border-red-600'
                      : 'bg-ink text-ink-on-dark border border-ink hover:opacity-90'
                }`}
              >
                {publishing ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : published ? (
                  <Check className="h-3.5 w-3.5" />
                ) : medicalMode ? (
                  <GraduationCap className="h-3.5 w-3.5" />
                ) : (
                  <BookOpen className="h-3.5 w-3.5" />
                )}
                {published ? t('summary.published') : publishing ? t('summary.publishing') : medicalMode ? 'Save to Medical Library' : t('summary.publish_library')}
              </button>
            )}

            {!isSharedView && !hideNewDocumentButton && (
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-secondary-ink border border-divider hover:bg-subtle/60 transition-colors duration-[var(--s4-dur-fast)]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {t('summary.new_document')}
              </button>
            )}
          </div>
        </div>

        {/* Summary prose body */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Medical mode clinical banner */}
          {medicalMode && (
            <div className="mb-4 p-3 bg-red-50 border-l-[3px] border-red-500">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-red-700">Clinical Summary</span>
              </div>
              <p className="text-[12px] text-red-800 leading-relaxed">
                Optimised for medical education — pathophysiology, clinical correlations, and board exam high-yield content.
              </p>
            </div>
          )}
          <div className="text-[13px] text-secondary-ink leading-[1.82]">
            <HighlightLayer text={combinedSummary} itemId={effectiveLibraryItemId} />
          </div>
        </div>
      </div>
    )}

    <Modal isOpen={mindMapOpen} onClose={() => setMindMapOpen(false)} title={t('mind_map.title')} maxWidth="2xl">
      <React.Suspense fallback={<div className="flex items-center justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" /></div>}>
        <MindMapView text={combinedSummary} title={t('mind_map.title')} />
      </React.Suspense>
    </Modal>

    {/* Publish to Library Modal */}
    {showPublishModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[var(--s4-shadow-floating)] max-w-lg w-full max-h-[85vh] flex flex-col border border-divider dark:border-divider-on-dark`}>

          <div className={`px-5 pt-5 pb-4 border-b border-divider dark:border-divider-on-dark flex-shrink-0`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`text-base font-semibold text-ink dark:text-ink-on-dark`}>{t('publish_modal.publish_to_library')}</h3>
                <p className={`text-xs text-muted-ink dark:text-muted-ink-on-dark mt-0.5`}>{t('publish_modal.choose_folder_tags')}</p>
                <p className={`text-xs text-muted-ink dark:text-muted-ink-on-dark mt-1 flex items-center gap-1`}>
                  <Globe className="h-3 w-3 flex-shrink-0" />
                  Published items are visible to all subscribed users.
                </p>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className={`p-1.5 rounded-full text-muted-ink dark:text-muted-ink-on-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex-shrink-0`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-5 py-4 space-y-5 overflow-y-auto flex-1">

            {/* Folder Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-medium uppercase tracking-widest opacity-50 text-ink dark:text-ink-on-dark`}>
                  <Folder className="h-3 w-3 inline mr-1" />
                  {t('publish_modal.folder_optional')}
                </label>
                {!showCreateFolderInput && (
                  <button
                    onClick={() => setShowCreateFolderInput(true)}
                    className={`text-xs flex items-center gap-1 text-muted-ink dark:text-muted-ink-on-dark hover:opacity-80`}
                  >
                    <Plus className="h-3 w-3" />
                    {t('publish_modal.create_new_folder')}
                  </button>
                )}
              </div>

              {showCreateFolderInput && (
                <div className={`mb-2 p-2 rounded-[var(--s4-radius-card)] border border-divider dark:border-divider-on-dark bg-subtle`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newFolderNameInput}
                      onChange={(e) => setNewFolderNameInput(e.target.value)}
                      placeholder={t('publish_modal.new_folder_name')}
                      className={`flex-1 px-2.5 py-1.5 text-sm border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark`}
                      onKeyPress={(e) => e.key === 'Enter' && createFolderInPublishModal()}
                    />
                    <button
                      onClick={createFolderInPublishModal}
                      disabled={creatingFolder}
                      className="p-1.5 rounded-full text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 disabled:opacity-50 transition-colors dark:text-emerald-400 dark:bg-emerald-950/40"
                    >
                      {creatingFolder ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => { setShowCreateFolderInput(false); setNewFolderNameInput(''); }}
                      className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors dark:bg-red-950/40"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className={`w-full px-3 py-2 text-sm border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark`}
              >
                <option value="">{t('publish_modal.no_folder')}</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>

            {/* Predefined Topics — pill chips */}
            <div>
              <label className={`text-xs font-medium uppercase tracking-widest opacity-50 text-ink dark:text-ink-on-dark mb-2 block`}>
                <Tag className="h-3 w-3 inline mr-1" />
                {t('publish_modal.suggested_topics')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PREDEFINED_TOPICS.map(topic => {
                  const isSelected = selectedPredefinedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        setSelectedPredefinedTopics(prev =>
                          isSelected ? prev.filter(t => t !== topic) : [...prev, topic]
                        );
                      }}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : `border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark hover:bg-black/5 dark:hover:bg-white/5`
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags — pill chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-medium uppercase tracking-widest opacity-50 text-ink dark:text-ink-on-dark`}>
                  <Tag className="h-3 w-3 inline mr-1" />
                  Tags <span className="normal-case tracking-normal opacity-100 text-red-500">*</span>
                </label>
                {!showCreateTag && (
                  <button
                    onClick={() => setShowCreateTag(true)}
                    className={`text-xs flex items-center gap-1 text-muted-ink dark:text-muted-ink-on-dark hover:opacity-80`}
                  >
                    <Plus className="h-3 w-3" />
                    New private tag
                  </button>
                )}
              </div>

              {showCreateTag && (
                <div className={`mb-3 p-2 rounded-[var(--s4-radius-card)] border border-divider dark:border-divider-on-dark bg-subtle`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="New private tag name"
                      className={`flex-1 px-2.5 py-1.5 text-sm border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark`}
                      onKeyPress={(e) => e.key === 'Enter' && createTag()}
                    />
                    <button onClick={createTag} className="p-1.5 rounded-full text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors dark:text-emerald-400 dark:bg-emerald-950/40">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { setShowCreateTag(false); setNewTagName(''); }}
                      className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors dark:bg-red-950/40"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Public tags */}
              {tags.filter(t => t.is_public).length > 0 && (
                <div className="mb-3">
                  <p className={`text-[10px] uppercase tracking-widest text-muted-ink dark:text-muted-ink-on-dark mb-1.5 flex items-center gap-1`}>
                    <Globe className="h-2.5 w-2.5" /> Public
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.filter(t => t.is_public).map(tag => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => setSelectedTagIds(prev =>
                            isSelected ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                          )}
                          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                            isSelected
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : `border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark hover:bg-black/5 dark:hover:bg-white/5`
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Private tags */}
              {tags.filter(t => !t.is_public && t.user_id).length > 0 && (
                <div>
                  <p className={`text-[10px] uppercase tracking-widest text-muted-ink dark:text-muted-ink-on-dark mb-1.5 flex items-center gap-1`}>
                    <Lock className="h-2.5 w-2.5" /> Private
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.filter(t => !t.is_public && t.user_id).map(tag => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => setSelectedTagIds(prev =>
                            isSelected ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                          )}
                          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                            isSelected
                              ? 'bg-card-dark border-divider-on-dark text-ink-on-dark dark:bg-subtle dark:border-divider dark:text-ink'
                              : `border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark hover:bg-black/5 dark:hover:bg-white/5`
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {tags.length === 0 && (
                <p className={`text-xs italic text-muted-ink dark:text-muted-ink-on-dark`}>No tags yet. Create a private tag or select a topic above.</p>
              )}

              {(selectedTagIds.length === 0 && selectedPredefinedTopics.length === 0) && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  Select at least one tag or topic to publish.
                </p>
              )}
            </div>

          </div>

          <div className={`px-5 py-4 border-t border-divider dark:border-divider-on-dark flex items-center justify-end gap-3 flex-shrink-0`}>
            <button
              onClick={() => setShowPublishModal(false)}
              className={`px-4 py-2 text-sm text-secondary-ink dark:text-muted-ink-on-dark hover:opacity-80 transition-opacity`}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => {
                const totalTags = selectedTagIds.length + selectedPredefinedTopics.length;
                if (totalTags === 0) {
                  showErrorToast('Please select at least one tag or topic before publishing');
                  return;
                }
                handlePublishToLibrary(selectedFolderId || undefined, selectedTagIds);
              }}
              disabled={publishing || (selectedTagIds.length === 0 && selectedPredefinedTopics.length === 0)}
              className="btn-soft-primary flex items-center gap-2 disabled:opacity-50"
            >
              {publishing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4" />
              )}
              {publishing ? t('summary.publishing') : t('summary.publish_library')}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};