import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { BookOpen, Search, Eye, Share2, Trash2, CheckCircle2, AlertCircle, X, Tag, FileText, Stethoscope, Filter } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../contexts/I18nContext';
import { supabase } from '../../lib/supabase';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { TopicsTagsModal } from './TopicsTagsModal';
import { PREDEFINED_TOPICS } from '../../utils/config';
import { usePageTutorial } from '../../hooks/usePageTutorial';
import { PageTutorial } from '../Onboarding/PageTutorial';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { PerformanceMonitor } from '../../utils/performanceMonitor';
import { LoadingSkeleton } from '../Common/LoadingSkeleton';
import { useConfirm } from '../../hooks/useConfirm';
import { PageHeader, ScholarButton } from '../Scholar';

// GlobalExam interface removed - moved to QuizPage

interface LibraryItem {
  id: string;
  title: string;
  summary_text: string;
  flashcards_json: Array<{ front: string; back: string }>;
  original_text_content?: string;
  original_file_name?: string;
  topics?: string[];
  created_at: string;
  last_viewed_at?: string;
  folder_id?: string;
  shareable_link?: string;
  is_public?: boolean;
  user_id: string;
  creator_email?: string;
  user_profiles?: { email: string };
  reaction_counts?: { like_count?: number; favorite_count?: number };
  comment_count?: number;
  notesCount?: number;
  hasNotes?: boolean;
}

interface _UserFolder {
  id: string;
  name: string;
  parent_folder_id?: string;
  created_at: string;
  is_shared?: boolean;
  is_public?: boolean;
  user_id: string;
  owner_email?: string;
}

interface UserTag {
  id: string;
  name: string;
  is_public?: boolean;
  user_id?: string;
}

interface SharedFolder {
  id: string;
  name: string;
  permission_level: 'read' | 'write' | 'admin';
  owner_id: string;
  owner_email?: string;
}

interface PendingInvitation {
  id: string;
  folder_id: string;
  folder_name: string;
  invited_by_email?: string;
  permission_level: 'read' | 'write' | 'admin';
}

const TOPIC_COLORS: Record<string, [string, string]> = {
  biology: ['#2E4228', '#D8E8C8'], anatomy: ['#2E4228', '#D8E8C8'], physiology: ['#2E4228', '#D8E8C8'], genetics: ['#2E4228', '#D8E8C8'],
  chemistry: ['#3A2E1E', '#F0DCBC'], biochemistry: ['#3A2E1E', '#F0DCBC'], pharmacology: ['#3A2E1E', '#F0DCBC'],
  physics: ['#2A3E4A', '#D8E8E0'], engineering: ['#2A3E4A', '#D8E8E0'], astronomy: ['#2A3E4A', '#D8E8E0'],
  mathematics: ['#1C3555', '#E8DFC8'], statistics: ['#1C3555', '#E8DFC8'],
  'computer science': ['#1A2A48', '#C8D8F0'], programming: ['#1A2A48', '#C8D8F0'],
  economics: ['#6B4E1A', '#F8EDD0'], business: ['#6B4E1A', '#F8EDD0'], law: ['#6B4E1A', '#F8EDD0'],
  psychology: ['#4A2830', '#F0D8DC'], psychiatry: ['#4A2830', '#F0D8DC'],
  history: ['#3A3020', '#F0E8C8'], geography: ['#3A3020', '#F0E8C8'],
  literature: ['#DDD5B8', '#2A2218'], art: ['#DDD5B8', '#2A2218'],
  medicine: ['#2C3E50', '#ECF0F1'], cardiology: ['#2C3E50', '#ECF0F1'], neurology: ['#2C3E50', '#ECF0F1'],
};

export const LibraryPage: React.FC = React.memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const { confirm, ConfirmModal } = useConfirm();
  const { shouldShowTutorial, showTutorial, isTutorialOpen, completeTutorial, skipTutorial, config: tutorialConfig } = usePageTutorial('library');
  const { preferences: _preferences } = useUserPreferences();
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [tags, setTags] = useState<UserTag[]>([]);
  const [_sharedFolders, setSharedFolders] = useState<SharedFolder[]>([]);
  const [_pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('created_at_desc');
  const [viewFilter, setViewFilter] = useState<'all' | 'mine' | 'community' | 'liked'>(() => {
    const saved = localStorage.getItem('library_view_filter');
    if (saved === 'community' || saved === 'liked' || saved === 'mine') {
      return saved;
    }
    return 'mine';
  });
  const [selectMultipleMode, setSelectMultipleMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [_showManageSharing, _setShowManageSharing] = useState<string | null>(null);
  const [showTopicsTagsModal, setShowTopicsTagsModal] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [libraryViewMode, setLibraryViewMode] = useState<'library' | 'notebook'>(() => {
    const saved = localStorage.getItem('library_view_mode');
    return (saved as 'library' | 'notebook') || 'library';
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debounce search query to avoid excessive database queries
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const shelfData = useMemo(() => {
    const counts: Record<string, { count: number; bg: string; txt: string }> = {};
    libraryItems.forEach(item => {
      item.topics?.forEach(topic => {
        const key = topic.toLowerCase();
        if (!counts[key]) {
          const matchKey = Object.keys(TOPIC_COLORS).find(k => key.includes(k) || k.includes(key));
          const [bg, txt] = matchKey ? TOPIC_COLORS[matchKey] : ['#3A3020', '#F0E8C8'];
          counts[key] = { count: 0, bg, txt };
        }
        counts[key].count++;
      });
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 16)
      .map(([label, data]) => ({ label, ...data }));
  }, [libraryItems]);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
  };

  // Persist view filter to localStorage
  useEffect(() => {
    localStorage.setItem('library_view_filter', viewFilter);
    ErrorLogger.debug('View filter changed', { component: 'LibraryPage', action: 'setViewFilter', viewFilter });
  }, [viewFilter]);

  // Listen for library publish events
  useEffect(() => {
    const handleLibraryPublish = (event: Event) => {
      const customEvent = event as CustomEvent;
      ErrorLogger.debug('Received libraryItemPublished event', { component: 'LibraryPage', action: 'handleLibraryItemPublished', itemId: customEvent.detail?.id });
      ErrorLogger.debug('Triggering library refresh', { component: 'LibraryPage', action: 'handleLibraryItemPublished' });
      setRefreshTrigger(prev => prev + 1);
      showNotification('Item published successfully!', 'success');
    };

    window.addEventListener('libraryItemPublished', handleLibraryPublish);
    return () => window.removeEventListener('libraryItemPublished', handleLibraryPublish);
  }, []);

  // Show tutorial on first visit
  useEffect(() => {
    if (shouldShowTutorial && !initialLoading) {
      const timer = setTimeout(() => {
        showTutorial();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTutorial, initialLoading, showTutorial]);

  useEffect(() => {
    if (user) {
      ErrorLogger.debug('Fetching library data', { component: 'LibraryPage', action: 'fetchLibraryData', refreshTrigger, viewFilter });
      const isInitialLoad = libraryItems.length === 0;
      fetchLibraryData(isInitialLoad);
    }
  }, [user, debouncedSearchQuery, selectedTags, selectedTopics, sortOption, viewFilter, libraryViewMode, refreshTrigger]);

  const fetchLibraryData = async (isInitialLoad = false) => {
    if (!user) return;

    return PerformanceMonitor.measureAsync('LibraryPage.fetchLibraryData', async () => {
      try {
        // Set appropriate loading state based on context
        if (isInitialLoad) {
          setInitialLoading(true);
        } else {
          setSearchLoading(true);
        }
        setError(null);

        // Fetch tags, library items, shared folders, and pending invitations
        await Promise.all([
          fetchTags(),
          fetchLibraryItems(),
          fetchSharedFolders(),
          fetchPendingInvitations()
        ]);
      } catch (err) {
        const message = handleApiError(err, { component: 'LibraryPage', action: 'fetchLibraryData' });
        ErrorLogger.error(err instanceof Error ? err : new Error(String(err)), { component: 'LibraryPage', action: 'fetchLibraryData' });
        setError(message);
      } finally {
        if (isInitialLoad) {
          setInitialLoading(false);
        } else {
          setSearchLoading(false);
        }
      }
    });
  };


  const fetchTags = async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showNotification);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order('is_public', { ascending: false })
        .order('name');

      if (error) {
        const message = handleSupabaseError(error, { component: 'LibraryPage', action: 'fetchTags' });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'LibraryPage', action: 'fetchTags' });
        showNotification(message, 'error');
        return;
      }

      setTags(data || []);
    } catch (error) {
      const message = handleApiError(error, { component: 'LibraryPage', action: 'fetchTags' });
      showNotification(message, 'error');
    }
  };

  const fetchLibraryItems = async () => {
    if (!user) return;

    ErrorLogger.debug('Starting fetch with filters', { component: 'LibraryPage', action: 'fetchLibraryItems', viewFilter, searchQuery: debouncedSearchQuery, libraryViewMode, userId: user.id });

    let query = supabase
      .from('user_library_items')
      .select('*');

    // Apply view filter (all, mine, community, or liked)
    if (viewFilter === 'mine') {
      ErrorLogger.debug('Filtering for MY items only', { component: 'LibraryPage', action: 'fetchLibraryItems', userId: user.id });
      query = query.eq('user_id', user.id);
    } else if (viewFilter === 'community') {
      ErrorLogger.debug('Filtering for COMMUNITY items only', { component: 'LibraryPage', action: 'fetchLibraryItems', userId: user.id });
      query = query.neq('user_id', user.id);
    } else if (viewFilter === 'liked') {
      ErrorLogger.debug('Filtering for LIKED items only', { component: 'LibraryPage', action: 'fetchLibraryItems', userId: user.id });
      // For liked items, we'll filter after fetching by checking item_reactions
      // This is because Supabase doesn't support direct joins in the client
    } else {
      ErrorLogger.debug('Showing ALL items (no user filter)', { component: 'LibraryPage', action: 'fetchLibraryItems' });
    }
    // If 'all', don't add user_id filter


    // Apply search filter (using debounced value)
    if (debouncedSearchQuery) {
      // Escape special characters and use PostgREST ilike syntax with * wildcards
      const escapedQuery = debouncedSearchQuery.replace(/[%_*]/g, '\\$&');
      query = query.or(`title.ilike.*${escapedQuery}*,summary_text.ilike.*${escapedQuery}*`);
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      // This is a simplified approach; you might need a more complex query for tag filtering
      // For now, we'll filter on the frontend after fetching
    }

    // Apply sorting
    if (sortOption === 'created_at_desc') {
      query = query.order('created_at', { ascending: false });
    } else if (sortOption === 'created_at_asc') {
      query = query.order('created_at', { ascending: true });
    } else if (sortOption === 'last_viewed_desc') {
      query = query.order('last_viewed_at', { ascending: false, nullsFirst: false });
    } else if (sortOption === 'last_viewed_asc') {
      query = query.order('last_viewed_at', { ascending: true, nullsFirst: false });
    } else if (sortOption === 'title_asc') {
      query = query.order('title', { ascending: true });
    } else if (sortOption === 'title_desc') {
      query = query.order('title', { ascending: false });
    } else if (sortOption === 'like_count_desc') {
      // Note: JSONB sorting not directly supported in Supabase client
      // Will sort on frontend after fetching
      query = query.order('created_at', { ascending: false }); // Default sort, will override
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      const message = handleSupabaseError(error, { component: 'LibraryPage', action: 'fetchLibraryItems' });
      ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'LibraryPage', action: 'fetchLibraryItems' });
      setError(message);
      return;
    }

    ErrorLogger.info('Successfully fetched library items', { component: 'LibraryPage', action: 'fetchLibraryItems', itemCount: (data || []).length });

    // Fetch creator emails from both user_profiles and admin_users
    const userIds = [...new Set((data || []).map(item => item.user_id))];

    const [userProfilesResult, adminUsersResult] = await Promise.all([
      supabase.from('user_profiles').select('id, email').in('id', userIds),
      supabase.from('admin_users').select('id, email').in('id', userIds)
    ]);

    // Create a map of user_id to email
    const emailMap = new Map();
    userProfilesResult.data?.forEach(profile => emailMap.set(profile.id, profile.email));
    adminUsersResult.data?.forEach(admin => emailMap.set(admin.id, admin.email));

    let filteredData = (data || []).map(item => ({
      ...item,
      creator_email: emailMap.get(item.user_id) || 'Unknown User'
    }));

    // Filter by tags if selected (frontend filtering for simplicity)
    if (selectedTags.length > 0) {
      const { data: itemTags } = await supabase
        .from('item_tags')
        .select('item_id, tag_id')
        .in('tag_id', selectedTags);

      if (itemTags) {
        const itemIdsWithTags = itemTags.map(it => it.item_id);
        filteredData = filteredData.filter(item => itemIdsWithTags.includes(item.id));
      }
    }

    // Filter by topics if selected (frontend filtering)
    if (selectedTopics.length > 0) {
      filteredData = filteredData.filter(item => {
        if (!item.topics || item.topics.length === 0) return false;
        // Check if item has at least one matching topic (OR logic within topics)
        return item.topics.some(topic => selectedTopics.includes(topic));
      });
    }

    // Filter by liked items if viewFilter is 'liked'
    if (viewFilter === 'liked') {
      const { data: likedItems } = await supabase
        .from('item_reactions')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('reaction_type', 'like');

      if (likedItems) {
        const likedItemIds = new Set(likedItems.map(li => li.item_id));
        filteredData = filteredData.filter(item => likedItemIds.has(item.id));
      } else {
        filteredData = []; // No liked items
      }
    }

    // All items and tags are now public by default, no need for additional filtering

    // Apply frontend sorting for like_count (JSONB sorting not supported in Supabase client)
    if (sortOption === 'like_count_desc') {
      filteredData.sort((a, b) => {
        const aLikes = a.reaction_counts?.like_count || 0;
        const bLikes = b.reaction_counts?.like_count || 0;
        return bLikes - aLikes; // Descending order (most liked first)
      });
    }

    // Apply locale-aware client-side sort for title so items matching the current
    // script (e.g., Arabic when the UI is in Arabic) sort naturally to the top.
    if (sortOption === 'title_asc' || sortOption === 'title_desc') {
      filteredData.sort((a, b) =>
        a.title.localeCompare(b.title, language, { sensitivity: 'base' })
      );
      if (sortOption === 'title_desc') filteredData.reverse();
    }

    // Fetch notes count for each item (for notebook filtering and badge display)
    if (filteredData.length > 0) {
      const itemIds = filteredData.map(item => item.id);
      const { data: notesData } = await supabase
        .from('summary_notes')
        .select('summary_id')
        .eq('user_id', user.id)
        .in('summary_id', itemIds);

      // Count notes per item
      const notesCountMap = new Map<string, number>();
      notesData?.forEach(note => {
        const count = notesCountMap.get(note.summary_id) || 0;
        notesCountMap.set(note.summary_id, count + 1);
      });

      // Add notes count to items
      filteredData = filteredData.map(item => ({
        ...item,
        notesCount: notesCountMap.get(item.id) || 0,
        hasNotes: (notesCountMap.get(item.id) || 0) > 0
      }));

      // Filter by notebook mode (show only items with notes)
      if (libraryViewMode === 'notebook') {
        filteredData = filteredData.filter(item => item.hasNotes);
      }
    }

    ErrorLogger.debug('Fetched items', { component: 'LibraryPage', action: 'fetchLibraryItems', itemCount: filteredData.length, libraryViewMode, sampleItems: filteredData.slice(0, 3).map(item => ({
      id: item.id,
      title: item.title,
      user_id: item.user_id,
      created_at: item.created_at,
      notesCount: item.notesCount || 0
    })) });

    setLibraryItems(filteredData);
  };

  const fetchSharedFolders = async () => {
    // Placeholder for shared folders functionality
    setSharedFolders([]);
  };

  const fetchPendingInvitations = async () => {
    // Placeholder for pending invitations functionality
    setPendingInvitations([]);
  };

  // fetchGlobalExams removed - moved to QuizPage

  const _handleAcceptInvitation = async (folderId: string) => {
    try {
      const { data: _data, error } = await supabase.functions.invoke('accept-folder-invitation', {
        body: { folder_id: folderId }
      });

      if (error) {
        showNotification(t('library.alert_failed_accept_invitation'), 'error');
        return;
      }

      await fetchLibraryData();
      showNotification('Invitation accepted successfully', 'success');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'LibraryPage', action: 'handleAcceptInvitation', metadata: { folderId } });
      showNotification(t('library.alert_failed_accept_invitation'), 'error');
    }
  };


  const handleDeleteItems = async () => {
    if (selectedItems.size === 0) return;

    if (isOffline()) {
      handleOfflineError(showNotification);
      return;
    }

    try {
      const itemIds = Array.from(selectedItems);
      const failedItems: string[] = [];
      
      for (const itemId of itemIds) {
        const { error } = await supabase
          .from('user_library_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user!.id);

        if (error) {
          ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { 
            component: 'LibraryPage', 
            action: 'handleDeleteItems', 
            metadata: { itemId },
            userId: user!.id
          });
          failedItems.push(itemId);
        }
      }

      await fetchLibraryItems();
      setSelectedItems(new Set());
      setSelectMultipleMode(false);
      setShowDeleteModal(false);
      
      if (failedItems.length > 0) {
        const successCount = itemIds.length - failedItems.length;
        if (successCount > 0) {
          showNotification(
            t('library.alert_items_deleted_partial', { 
              successCount,
              failedCount: failedItems.length
            }) || `${successCount} items deleted, ${failedItems.length} failed`, 
            'error'
          );
        } else {
          const message = handleApiError(new Error('Failed to delete items'), { component: 'LibraryPage', action: 'handleDeleteItems' });
          showNotification(message, 'error');
        }
      } else {
        showNotification(t('library.alert_items_deleted', { count: itemIds.length }), 'success');
      }
    } catch (error) {
      const message = handleApiError(error, { component: 'LibraryPage', action: 'handleDeleteItems' });
      ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'LibraryPage', action: 'handleDeleteItems' });
      showNotification(message, 'error');
    }
  };

  const handleShareItem = async (itemId: string) => {
    if (isOffline()) {
      handleOfflineError(showNotification);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-share-link', {
        body: { item_id: itemId, action: 'generate' }
      });

      if (error) {
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { 
          component: 'LibraryPage', 
          action: 'handleShareItem', 
          itemId,
          userId: user?.id
        });
        showNotification(t('library.alert_failed_generate_share_link'), 'error');
        return;
      }

      if (data?.public_url) {
        try {
          await navigator.clipboard.writeText(data.public_url);
          showNotification(t('library.alert_share_link_generated'), 'success');
        } catch (clipboardError) {
          // Clipboard might fail, but link was generated - show success with note
          ErrorLogger.warn(clipboardError instanceof Error ? clipboardError.message : String(clipboardError), { 
            component: 'LibraryPage', 
            action: 'handleShareItem', 
            step: 'clipboard',
            itemId
          });
          showNotification(t('library.alert_share_link_generated') + ' (Link copied to clipboard)', 'success');
        }
        await fetchLibraryItems(); // Refresh to show updated sharing status
      } else {
        ErrorLogger.warn('No public_url in response', { 
          component: 'LibraryPage', 
          action: 'handleShareItem', 
          itemId,
          responseData: data
        });
        showNotification(t('library.alert_failed_generate_share_link'), 'error');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'LibraryPage', action: 'handleShareItem', itemId, userId: user?.id });
      showNotification(t('library.alert_failed_generate_share_link'), 'error');
    }
  };

  const handleUnshareItem = async (itemId: string) => {
    if (isOffline()) {
      handleOfflineError(showNotification);
      return;
    }

    try {
      const { data: _dataRevoke, error } = await supabase.functions.invoke('generate-share-link', {
        body: { item_id: itemId, action: 'revoke' }
      });

      if (error) {
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { 
          component: 'LibraryPage', 
          action: 'handleUnshareItem', 
          itemId,
          userId: user?.id
        });
        showNotification(t('library.alert_failed_revoke_share_link'), 'error');
        return;
      }

      showNotification(t('library.alert_share_link_revoked'), 'success');
      await fetchLibraryItems(); // Refresh to show updated sharing status
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'LibraryPage', action: 'handleUnshareItem', itemId, userId: user?.id });
      showNotification(t('library.alert_failed_revoke_share_link'), 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const confirmDelete = await confirm(t('library.confirm_delete_item'), {
      title: t('library.confirm_delete_item_title') || 'Delete Item',
      variant: 'destructive',
      confirmText: t('library.delete') || 'Delete',
    });
    if (!confirmDelete) return;

    if (isOffline()) {
      handleOfflineError(showNotification);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_library_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user!.id);

      if (error) {
        const message = handleSupabaseError(error, { component: 'LibraryPage', action: 'handleDeleteItem', metadata: { itemId } });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'LibraryPage', action: 'handleDeleteItem', metadata: { itemId } });
        showNotification(message, 'error');
        return;
      }

      await fetchLibraryItems();
      showNotification(t('library.alert_item_deleted'), 'success');
    } catch (error) {
      const message = handleApiError(error, { component: 'LibraryPage', action: 'handleDeleteItem', metadata: { itemId } });
      ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'LibraryPage', action: 'handleDeleteItem', metadata: { itemId }, userId: user!.id });
      showNotification(message, 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedTags.length > 0) count += selectedTags.length;
    if (selectedTopics.length > 0) count += selectedTopics.length;
    return count;
  };

  const _clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedTopics([]);
  };

  const handleApplyTopicsTagsFilters = (tags: string[], topics: string[]) => {
    setSelectedTags(tags);
    setSelectedTopics(topics);
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === libraryItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(libraryItems.map(item => item.id)));
    }
  };

  if (initialLoading) {
    return (
      <div className="w-full">
        <div className={`bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] p-8 dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-[var(--s4-shadow-hairline)] border border-divider dark:border-divider-on-dark`}>
          <LoadingSkeleton type="page" count={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className={`bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] p-8 dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-[var(--s4-shadow-hairline)] border border-divider dark:border-divider-on-dark`}>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className={`text-lg font-semibold text-ink dark:text-ink-on-dark mb-2`}>{t('common.error_loading_library')}</h3>
            <p className={`text-secondary-ink dark:text-secondary-ink-on-dark mb-4`}>{error}</p>
            <ScholarButton variant="primary" onClick={() => fetchLibraryData()} className="mx-auto">
              {t('common.try_again')}
            </ScholarButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="w-full">
      {/* Notification */}
      {notification.show && (
        <div className={`mb-6 p-4 rounded-[var(--s4-radius-card)] flex items-center space-x-3 ${
          notification.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
            : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium flex-1">{notification.message}</span>
          <button
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            className={`${
              notification.type === 'success'
                ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200'
                : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Scholar v4 PageHeader */}
      <PageHeader
        eyebrow={libraryViewMode === 'notebook'
          ? (t('notebook.eyebrow') || 'Personal')
          : `${libraryItems.length} VOLUMES CATALOGUED`}
        title={libraryViewMode === 'notebook'
          ? (t('notebook.title') || 'My Notebook')
          : 'The Library.'}
        descriptor={libraryViewMode === 'notebook'
          ? (t('notebook.subtitle') || 'Your personal notes and annotations')
          : 'indexed by subject, by date, by hand.'}
        className="mb-5"
        actions={
          <div className="flex items-center gap-3">
            {/* Search input right-aligned in header */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-ink dark:text-muted-ink-on-dark" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('library.search_library_placeholder')}
                className="pl-9 pr-4 py-2 text-sm border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus:border-transparent bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark w-48 sm:w-64 transition-[width] duration-[var(--s4-dur-fast)]"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-3.5 w-3.5 border-2 border-accent-gold border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            {/* Library / Notebook mode toggle */}
            <div
              role="tablist"
              aria-label={t('library.view_mode') || 'View mode'}
              className="inline-flex items-center border border-divider dark:border-divider-on-dark rounded-[6px] overflow-hidden"
            >
              <button
                role="tab"
                aria-selected={libraryViewMode === 'library'}
                onClick={() => {
                  setLibraryViewMode('library');
                  localStorage.setItem('library_view_mode', 'library');
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-[var(--s4-dur-fast)] inline-flex items-center gap-2 ${
                  libraryViewMode === 'library'
                    ? 'bg-sidebar text-ink-on-dark'
                    : 'bg-transparent text-secondary-ink dark:text-muted-ink-on-dark hover:bg-subtle'
                }`}
              >
                <BookOpen className="h-4 w-4" aria-hidden />
                {t('library.my_library_title') || 'My Library'}
              </button>
              <button
                role="tab"
                aria-selected={libraryViewMode === 'notebook'}
                onClick={() => {
                  setLibraryViewMode('notebook');
                  localStorage.setItem('library_view_mode', 'notebook');
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-[var(--s4-dur-fast)] inline-flex items-center gap-2 border-s border-divider dark:border-divider-on-dark ${
                  libraryViewMode === 'notebook'
                    ? 'bg-sidebar text-ink-on-dark'
                    : 'bg-transparent text-secondary-ink dark:text-muted-ink-on-dark hover:bg-subtle'
                }`}
              >
                <FileText className="h-4 w-4" aria-hidden />
                {t('notebook.title') || 'Notebook'}
              </button>
            </div>
          </div>
        }
      />

      {/* Bookshelf ranking bar — v4 signature visual */}
      {shelfData.length > 0 && (
        <div className="mb-5">
          <div className="flex items-baseline gap-2.5 mb-1.5">
            <span className="text-[9px] font-bold tracking-[2px] uppercase text-accent-gold">By subject — most volumes first</span>
            <div className="flex-1 h-px bg-divider dark:bg-divider-on-dark" />
            <span className="font-display text-[10px] text-muted-ink dark:text-muted-ink-on-dark">scroll →</span>
          </div>
          <div className="overflow-x-auto pb-0.5">
            <div className="flex gap-1 items-end" style={{ minWidth: 'max-content' }}>
              {shelfData.map(({ label, bg, txt, count }) => (
                <div
                  key={label}
                  className="flex-shrink-0 flex flex-col items-center cursor-pointer"
                  onClick={() => {
                    setSelectedTopics(prev =>
                      prev.includes(label)
                        ? prev.filter(t => t !== label)
                        : [...prev, label]
                    );
                  }}
                  title={`${label} (${count})`}
                >
                  <div className="relative overflow-hidden" style={{ width: 56, height: 155, background: bg }}>
                    <div
                      className="absolute inset-x-0 bottom-0"
                      style={{ height: `${Math.min(75, count * 18)}%`, background: 'var(--accent-gold)', opacity: 0.22 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      <span
                        className="font-display text-[10.5px] font-semibold capitalize leading-tight"
                        style={{
                          color: txt,
                          writingMode: 'vertical-rl',
                          textOrientation: 'mixed',
                          transform: 'rotate(180deg)',
                          maxHeight: 108,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                  <span className="text-[7.5px] font-bold tracking-[1px] uppercase text-muted-ink dark:text-muted-ink-on-dark mt-1">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[5px] bg-ink dark:bg-ink-on-dark opacity-85 mt-[3px]" />
        </div>
      )}

      {/* Scholar v4: SectionTabs (All | Mine | Community | Liked) */}
      <div className="mb-6">
        <div className="flex items-end justify-between gap-4 flex-wrap border-b border-divider dark:border-divider-on-dark pb-0">
          <div className="flex items-end gap-6">
            {(
              [
                { value: 'all' as const, label: t('library.all_items') || 'All' },
                { value: 'mine' as const, label: t('library.view_mine') || 'Mine' },
                { value: 'community' as const, label: t('library.view_community') || 'Community' },
                { value: 'liked' as const, label: t('library.view_liked') || 'Liked' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={viewFilter === value}
                onClick={() => setViewFilter(value)}
                className={[
                  'relative pb-3 pt-1 text-sm font-medium whitespace-nowrap transition-colors',
                  viewFilter === value
                    ? 'text-ink dark:text-ink-on-dark'
                    : 'text-muted-ink dark:text-muted-ink-on-dark hover:text-ink dark:hover:text-ink-on-dark',
                ].join(' ')}
              >
                {label}
                {viewFilter === value && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent-gold" />
                )}
              </button>
            ))}
          </div>

          {/* Filter chips row + sort dropdown */}
          <div className="flex items-center gap-2 pb-2">
            {/* Topic filter chips */}
            <button
              type="button"
              onClick={() => setShowTopicsTagsModal(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-[var(--s4-dur-fast)] ${
                (selectedTags.length > 0 || selectedTopics.length > 0)
                  ? 'bg-accent-gold text-ink-on-dark border-accent-gold'
                  : 'bg-chip dark:bg-card-dark border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark hover:border-accent-gold'
              }`}
            >
              <Filter className="h-3 w-3" aria-hidden />
              {t('library.topics_tags_heading') || 'Topics & Tags'}
              {(selectedTags.length > 0 || selectedTopics.length > 0) && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-card-light/20 text-ink-on-dark text-[10px] font-bold">
                  {selectedTags.length + selectedTopics.length}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-1.5 text-xs border border-divider dark:border-divider-on-dark rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold bg-chip dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark cursor-pointer"
              aria-label={t('library.sort_by')}
            >
              <option value="created_at_desc">{t('library.sort_created_newest')}</option>
              <option value="created_at_asc">{t('library.sort_created_oldest')}</option>
              <option value="last_viewed_desc">{t('library.sort_last_viewed')}</option>
              <option value="title_asc">{t('library.sort_title_az')}</option>
              <option value="title_desc">{t('library.sort_title_za')}</option>
              <option value="like_count_desc">{t('library.sort_most_liked')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active filter pills */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-muted-ink dark:text-muted-ink-on-dark">{t('library.active_filters')}:</span>
          {searchQuery && (
            <span className="px-2 py-1 text-xs rounded-full bg-chip dark:bg-card-dark border border-divider dark:border-divider-on-dark text-ink dark:text-ink-on-dark">
              Search: {searchQuery}
            </span>
          )}
          {selectedTags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag ? (
              <span key={tagId} className="px-2 py-1 text-xs rounded-full bg-chip dark:bg-card-dark border border-divider dark:border-divider-on-dark text-ink dark:text-ink-on-dark">
                <Tag className="h-3 w-3 inline mr-1" />
                {tag.name}
              </span>
            ) : null;
          })}
          {selectedTopics.map(topic => (
            <span key={topic} className="px-2 py-1 text-xs rounded-full bg-chip dark:bg-card-dark border border-divider dark:border-divider-on-dark text-ink dark:text-ink-on-dark">
              <BookOpen className="h-3 w-3 inline mr-1" />
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Multi-select controls */}
      {selectMultipleMode && (
        <div className="flex items-center justify-between p-3 mb-4 bg-subtle dark:bg-subtle-on-dark rounded-[var(--s4-radius-card)] border border-divider dark:border-divider-on-dark">
          <span className="text-sm font-medium text-secondary-ink dark:text-secondary-ink-on-dark">
            {selectedItems.size > 0
              ? t('library.items_selected', { count: selectedItems.size })
              : t('library.select_multiple')
            }
          </span>
          <div className="flex items-center gap-3">
            {selectedItems.size > 0 && (
              <>
                <ScholarButton
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                >
                  {t('library.delete_button', { count: selectedItems.size })}
                </ScholarButton>
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="text-sm text-muted-ink dark:text-muted-ink-on-dark hover:text-ink dark:hover:text-ink-on-dark"
                >
                  {t('library.clear_selection')}
                </button>
              </>
            )}
            <button
              onClick={handleSelectAll}
              className="text-sm text-accent-gold hover:opacity-80"
            >
              {selectedItems.size === libraryItems.length ? t('library.deselect_all') : t('library.select_all')}
            </button>
          </div>
        </div>
      )}

      {/* v4 body: topics sidebar + catalogue table */}
      <div className="grid gap-7" style={{ gridTemplateColumns: '190px 1fr' }}>

        {/* Topics sidebar */}
        <aside>
          <div className="text-[10px] font-bold tracking-[2px] uppercase text-accent-gold mb-2.5">Topics</div>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => setSelectedTopics([])}
              className="border-none text-left px-2.5 py-2 flex justify-between items-baseline text-[13px] font-medium transition-colors duration-[var(--s4-dur-fast)]"
              style={{
                background: selectedTopics.length === 0 ? 'var(--color-accent-gold-soft, #F0E4CB)' : 'transparent',
                borderLeft: selectedTopics.length === 0 ? '2px solid var(--color-accent-gold, #B8893A)' : '2px solid transparent',
                color: selectedTopics.length === 0 ? 'var(--color-accent-gold, #B8893A)' : undefined,
                fontWeight: selectedTopics.length === 0 ? 600 : 500,
              }}
            >
              <span>All topics</span>
              <span className="font-display text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{libraryItems.length}</span>
            </button>
            {shelfData.map(({ label, count }) => {
              const active = selectedTopics.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedTopics(prev =>
                    prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]
                  )}
                  className="border-none text-left px-2.5 py-2 flex justify-between items-baseline text-[13px] capitalize transition-colors duration-[var(--s4-dur-fast)]"
                  style={{
                    background: active ? 'var(--color-accent-gold-soft, #F0E4CB)' : 'transparent',
                    borderLeft: active ? '2px solid var(--color-accent-gold, #B8893A)' : '2px solid transparent',
                    color: active ? 'var(--color-accent-gold, #B8893A)' : undefined,
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <span>{label}</span>
                  <span className="font-display text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="h-px bg-divider dark:bg-divider-on-dark my-3.5" />
          <button
            type="button"
            onClick={() => setShowTopicsTagsModal(true)}
            className="text-[12px] font-display text-muted-ink dark:text-muted-ink-on-dark hover:text-accent-gold transition-colors duration-[var(--s4-dur-fast)] bg-transparent border-none cursor-pointer p-0"
          >
            + manage topics
          </button>
        </aside>

        <div className="w-full min-w-0">
          {libraryItems.length === 0 ? (
            <div className="text-center py-20 min-h-[40vh] flex flex-col items-center justify-center">
              {libraryViewMode === 'notebook' ? (
                <>
                  <FileText className="h-12 w-12 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4" />
                  <h3 className="font-display text-xl text-ink dark:text-ink-on-dark mb-2">
                    {t('notebook.no_items_with_notes') || 'No Notes Yet'}
                  </h3>
                  <p className="text-secondary-ink dark:text-secondary-ink-on-dark max-w-sm">
                    {t('notebook.add_notes_to_items') || 'Start adding notes to your library items. They will appear here for easy access.'}
                  </p>
                </>
              ) : (
                <>
                  <BookOpen className="h-12 w-12 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4" />
                  <h3 className="font-display text-xl text-ink dark:text-ink-on-dark mb-2">
                    {searchQuery || selectedTags.length > 0
                      ? t('library.no_items_match_search')
                      : t('library.no_library_items_yet')}
                  </h3>
                  <p className="text-secondary-ink dark:text-secondary-ink-on-dark mb-6 max-w-sm">
                    {searchQuery || selectedTags.length > 0
                      ? t('library.adjust_search_filter')
                      : t('library.process_to_build_library')}
                  </p>
                  {!searchQuery && selectedTags.length === 0 && (
                    <ScholarButton variant="primary" onClick={() => navigate('/')}>
                      {t('library.process_first_cta') || 'Process your first document'}
                    </ScholarButton>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] overflow-hidden shadow-[var(--s4-shadow-hairline)]">
              {/* Table header */}
              <div className="grid gap-3.5 px-5 py-2 border-b border-divider dark:border-divider-on-dark" style={{ gridTemplateColumns: '1fr 120px 120px 110px' }}>
                <span className="text-[10px] font-bold tracking-[2px] uppercase text-muted-ink dark:text-muted-ink-on-dark">Title</span>
                <span className="text-[10px] font-bold tracking-[2px] uppercase text-muted-ink dark:text-muted-ink-on-dark hidden sm:block">Subject</span>
                <span className="text-[10px] font-bold tracking-[2px] uppercase text-muted-ink dark:text-muted-ink-on-dark hidden md:block">Format</span>
                <span className="text-[10px] font-bold tracking-[2px] uppercase text-muted-ink dark:text-muted-ink-on-dark">Catalogued</span>
              </div>

              {/* Table rows */}
              {libraryItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`group grid gap-3.5 items-center px-5 py-[14px] hover:bg-subtle/60 dark:hover:bg-subtle-on-dark/20 transition-colors duration-[var(--s4-dur-fast)] cursor-pointer ${
                    index < libraryItems.length - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''
                  }`}
                  style={{ gridTemplateColumns: '1fr 120px 120px 110px' }}
                  onClick={() => navigate(`/view/library/${item.id}`)}
                >
                  {/* TITLE column with topic accent bar */}
                  <div className="flex items-center gap-2 min-w-0">
                    {selectMultipleMode && (
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => { e.stopPropagation(); handleSelectItem(item.id); }}
                        className="h-3.5 w-3.5 text-accent-gold focus-visible:ring-accent-gold border border-divider dark:border-divider-on-dark rounded flex-shrink-0"
                      />
                    )}
                    <div
                      className="flex-shrink-0 opacity-80"
                      style={{
                        width: 3,
                        height: 20,
                        background: (item.topics?.[0] && TOPIC_COLORS[item.topics[0].toLowerCase()]?.[0]) || 'var(--color-accent-gold)',
                      }}
                    />
                    <div className="min-w-0">
                      <span className="font-display text-sm font-semibold text-ink dark:text-ink-on-dark truncate block leading-snug">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.user_id !== user?.id && (
                          <span className="text-[9px] font-bold tracking-[1px] uppercase text-muted-ink dark:text-muted-ink-on-dark">Community</span>
                        )}
                        {(item.title.toLowerCase().includes('medical') ||
                          item.topics?.some(topic => ['cardiology', 'neurology', 'medicine', 'clinical', 'pathology', 'anatomy', 'physiology'].some(med => topic.toLowerCase().includes(med)))) && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold tracking-[1px] uppercase text-red-500 dark:text-red-400">
                            <Stethoscope className="h-2.5 w-2.5" />
                            Medical
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SUBJECT column */}
                  <div className="hidden sm:block min-w-0">
                    {item.topics && item.topics.length > 0 ? (
                      <span className="text-[11px] tracking-[1.5px] font-bold uppercase text-secondary-ink dark:text-muted-ink-on-dark truncate block">
                        {item.topics[0]}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">—</span>
                    )}
                  </div>

                  {/* FORMAT column */}
                  <div className="hidden md:block min-w-0">
                    <span className="font-display text-[12.5px] text-muted-ink dark:text-muted-ink-on-dark whitespace-nowrap">
                      {item.flashcards_json.length > 0
                        ? `${item.flashcards_json.length} cards`
                        : 'Summary'}
                    </span>
                  </div>

                  {/* CATALOGUED + actions */}
                  <div className="flex items-center justify-end gap-2 min-w-0">
                    <span className="font-display text-[12px] text-muted-ink dark:text-muted-ink-on-dark whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </span>
                    {!selectMultipleMode && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--s4-dur-fast)]">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/view/library/${item.id}`); }}
                          className="p-1 rounded hover:bg-subtle dark:hover:bg-card-dark text-muted-ink dark:text-muted-ink-on-dark hover:text-accent-gold transition-colors"
                          title={t('library.view')}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {item.is_public && item.shareable_link ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUnshareItem(item.id); }}
                            className="p-1 rounded hover:bg-subtle dark:hover:bg-card-dark text-muted-ink dark:text-muted-ink-on-dark hover:text-orange-500 transition-colors"
                            title={t('library.unshare')}
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShareItem(item.id); }}
                            className="p-1 rounded hover:bg-subtle dark:hover:bg-card-dark text-muted-ink dark:text-muted-ink-on-dark hover:text-green-600 transition-colors"
                            title={t('library.share')}
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {item.user_id === user?.id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                            className="p-1 rounded hover:bg-subtle dark:hover:bg-card-dark text-muted-ink dark:text-muted-ink-on-dark hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>{/* end grid: sidebar + catalogue */}

      {/* Delete Items Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-page bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] max-w-md w-full dark:shadow border border-divider dark:border-divider-on-dark`}>
            <div className={`p-6 border-b border border-divider dark:border-divider-on-dark`}>
              <h3 className={`text-lg font-semibold text-ink dark:text-ink-on-dark`}>{t('library.delete_items_title')}</h3>
              <p className="text-sm text-red-600 mt-1 dark:text-red-400">{t('library.action_cannot_be_undone')}</p>
            </div>
            
            <div className="p-6">
              <p className={'text-secondary-ink dark:text-secondary-ink-on-dark'}>
                {t('library.confirm_bulk_delete', { count: selectedItems.size })}
              </p>
            </div>
            
            <div className={`p-6 border-t border border-divider dark:border-divider-on-dark flex justify-end space-x-3`}>
              <ScholarButton variant="secondary" onClick={() => setShowDeleteModal(false)}>
                {t('common.cancel')}
              </ScholarButton>
              <ScholarButton variant="danger" onClick={handleDeleteItems}>
                {t('library.delete_items_button')}
              </ScholarButton>
            </div>
          </div>
        </div>
      )}

      {/* Topics & Tags Modal */}
      <TopicsTagsModal
        isOpen={showTopicsTagsModal}
        onClose={() => setShowTopicsTagsModal(false)}
        tags={tags}
        predefinedTopics={[...PREDEFINED_TOPICS]}
        selectedTags={selectedTags}
        selectedTopics={selectedTopics}
        onApply={handleApplyTopicsTagsFilters}
      />

      {/* Global Exam Detail Modal */}
      {/* GlobalExamDetailModal removed - moved to QuizPage */}

      {/* Confirmation Modal */}
      {ConfirmModal}

      {/* Library Tutorial */}
      {tutorialConfig && (
        <PageTutorial
          config={tutorialConfig}
          isOpen={isTutorialOpen}
          onClose={() => {}}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
        />
      )}
    </div>
    </>
  );
});