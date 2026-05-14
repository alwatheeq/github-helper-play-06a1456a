import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Folder, Search, Edit2, Trash2, User, Calendar, X, Save } from 'lucide-react';
import { useToast } from '../Toast/Toast';
import { ErrorLogger } from '../../utils/errorLogger';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';
import { useConfirm } from '../../hooks/useConfirm';

interface FolderData {
  id: string;
  name: string;
  user_id: string;
  parent_folder_id?: string;
  created_at: string;
  is_public?: boolean;
  user_email?: string;
  item_count?: number;
}

export const FoldersManagementPage: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { error: showErrorToast } = useToast();
  const { confirm } = useConfirm();
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const { data: foldersData, error: foldersError } = await supabase
        .from('user_folders')
        .select(`
          *,
          user_profiles!inner(email)
        `)
        .order('created_at', { ascending: false });

      if (foldersError) throw foldersError;

      const foldersWithCounts = await Promise.all(
        (foldersData || []).map(async (folder) => {
          const { count } = await supabase
            .from('user_library_items')
            .select('id', { count: 'exact', head: true })
            .eq('folder_id', folder.id);

          return {
            ...folder,
            user_email: folder.user_profiles?.email || 'Unknown',
            item_count: count || 0,
          };
        })
      );

      setFolders(foldersWithCounts);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'FoldersManagementPage', action: 'fetchFolders' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (folder: FolderData) => {
    setEditingFolder(folder.id);
    setEditingName(folder.name);
  };

  const handleCancelEdit = () => {
    setEditingFolder(null);
    setEditingName('');
  };

  const handleSaveEdit = async (folderId: string) => {
    if (!editingName.trim()) return;

    try {
      const { error } = await supabase
        .from('user_folders')
        .update({ name: editingName.trim() })
        .eq('id', folderId);

      if (error) throw error;

      if (user?.id) {
        const oldFolder = folders.find(f => f.id === folderId);
        try {
          await supabase.rpc('log_admin_action', {
            p_action_type: 'UPDATE',
            p_table_name: 'user_folders',
            p_record_id: folderId,
            p_old_values: { name: oldFolder?.name },
            p_new_values: { name: editingName.trim() },
            p_description: `Updated folder name from "${oldFolder?.name}" to "${editingName.trim()}"`
          });
        } catch (logErr: unknown) {
          const logError = logErr instanceof Error ? logErr : new Error(String(logErr));
          ErrorLogger.warn('Failed to log admin action', {
            component: 'FoldersManagementPage',
            action: 'handleSaveEdit',
            metadata: { folderId, error: logError.message }
          });
        }
      }

      await fetchFolders();
      setEditingFolder(null);
      setEditingName('');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, {
        component: 'FoldersManagementPage',
        action: 'handleSaveEdit',
        metadata: { folderId }
      });
      showErrorToast('Failed to update folder');
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string, itemCount: number) => {
    const confirmMsg = itemCount > 0
      ? `This folder "${folderName}" contains ${itemCount} items. Items will be moved to uncategorized. Continue?`
      : `Delete folder "${folderName}"?`;

    const confirmed = await confirm(confirmMsg, {
      title: 'Delete Folder',
      variant: 'destructive',
      confirmText: 'Delete',
    });
    if (!confirmed) return;

    try {
      await supabase
        .from('user_library_items')
        .update({ folder_id: null })
        .eq('folder_id', folderId);

      const { error } = await supabase
        .from('user_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      if (user?.id) {
        try {
          await supabase.rpc('log_admin_action', {
            p_action_type: 'DELETE',
            p_table_name: 'user_folders',
            p_record_id: folderId,
            p_old_values: { name: folderName, item_count: itemCount },
            p_description: `Deleted folder "${folderName}"${itemCount > 0 ? ` (${itemCount} items moved to uncategorized)` : ''}`
          });
        } catch (logErr: unknown) {
          const logError = logErr instanceof Error ? logErr : new Error(String(logErr));
          ErrorLogger.warn('Failed to log admin action', {
            component: 'FoldersManagementPage',
            action: 'handleDeleteFolder',
            metadata: { folderId, error: logError.message }
          });
        }
      }

      await fetchFolders();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, {
        component: 'FoldersManagementPage',
        action: 'handleDeleteFolder',
        metadata: { folderId }
      });
      showErrorToast('Failed to delete folder');
    }
  };

  const filteredFolders = useMemo(() =>
    folders.filter(folder =>
      folder.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      folder.user_email?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    ),
    [folders, debouncedSearchQuery]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink dark:text-ink-on-dark">Folder Management</h1>
          <p className="text-secondary-ink dark:text-muted-ink-on-dark mt-1">View, edit, and manage all user folders</p>
        </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark" />
            <input
              type="text"
              placeholder="Search folders by name or user email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-ink-on-dark placeholder:text-muted-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-subtle dark:bg-subtle-on-dark">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                    Folder Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card-light dark:bg-card-dark divide-y divide-divider dark:divide-divider-on-dark">
                {filteredFolders.map((folder) => (
                  <tr key={folder.id} className="hover:bg-subtle/50 dark:hover:bg-subtle-on-dark/30 transition">
                    <td className="px-6 py-6">
                      {editingFolder === folder.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-3 py-1 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-ink-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(folder.id)}
                            className="p-1 text-green-600 hover:text-green-800 dark:text-green-400"
                            title="Save"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Folder className="h-5 w-5 text-accent-gold" />
                          <span className="text-sm font-medium text-ink dark:text-ink-on-dark">
                            {folder.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-ink dark:text-muted-ink-on-dark" />
                        <span className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                          {folder.user_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className="px-3 py-1 bg-subtle dark:bg-subtle-on-dark text-muted-ink dark:text-muted-ink-on-dark rounded-full text-xs font-semibold">
                        {folder.item_count} items
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-ink dark:text-muted-ink-on-dark" />
                        <span className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                          {new Date(folder.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      {editingFolder !== folder.id && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleStartEdit(folder)}
                            className="p-2 text-accent-gold hover:opacity-80 hover:bg-subtle dark:hover:bg-subtle-on-dark transition"
                            title="Edit folder name"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFolder(folder.id, folder.name, folder.item_count || 0)}
                            className="p-2 text-red-600 dark:text-red-400 hover:opacity-80 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                            title="Delete folder"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredFolders.length === 0 && (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4" />
                <p className="text-muted-ink dark:text-muted-ink-on-dark">
                  {searchQuery ? 'No folders found matching your search' : 'No folders found'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-divider dark:border-divider-on-dark">
          <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
            Total: {filteredFolders.length} folders
          </p>
        </div>
      </div>
    </div>
  );
});
