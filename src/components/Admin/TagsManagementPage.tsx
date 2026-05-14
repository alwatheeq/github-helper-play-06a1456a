import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Tag, Search, Edit2, Trash2, User, X, Save } from 'lucide-react';
import { useToast } from '../Toast/Toast';
import { ErrorLogger } from '../../utils/errorLogger';
import { useDebounce } from '../../hooks/useDebounce';
import { useConfirm } from '../../hooks/useConfirm';
import { useAuth } from '../../hooks/useAuth';
import { tryLogAdminAction } from '../../utils/adminHelpers';

interface TagData {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  user_email?: string;
  usage_count?: number;
}

export const TagsManagementPage: React.FC = React.memo(() => {
  const { error: showErrorToast } = useToast();
  const { confirm, ConfirmModal } = useConfirm();
  const { user } = useAuth();
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const [{ data: tagsData, error: tagsError }, { data: tagCounts }] = await Promise.all([
        supabase
          .from('tags')
          .select('*, user_profiles!inner(email)')
          .order('name'),
        supabase
          .from('item_tags')
          .select('tag_id'),
      ]);

      if (tagsError) throw tagsError;

      const countMap = new Map<string, number>();
      tagCounts?.forEach(({ tag_id }) => {
        countMap.set(tag_id, (countMap.get(tag_id) || 0) + 1);
      });

      setTags((tagsData || []).map(tag => ({
        ...tag,
        user_email: tag.user_profiles?.email || 'Unknown',
        usage_count: countMap.get(tag.id) || 0,
      })));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'TagsManagementPage', action: 'fetchTags' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (tag: TagData) => {
    setEditingTag(tag.id);
    setEditingName(tag.name);
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditingName('');
  };

  const handleSaveEdit = async (tagId: string) => {
    if (!editingName.trim()) return;

    try {
      const { error } = await supabase
        .from('tags')
        .update({ name: editingName.trim() })
        .eq('id', tagId);

      if (error) throw error;

      if (user?.id) {
        const oldTag = tags.find(t => t.id === tagId);
        await tryLogAdminAction({
          p_action_type: 'UPDATE',
          p_table_name: 'tags',
          p_record_id: tagId,
          p_old_values: { name: oldTag?.name },
          p_new_values: { name: editingName.trim() },
          p_description: `Updated tag name from "${oldTag?.name}" to "${editingName.trim()}"`,
        }, { component: 'TagsManagementPage', action: 'handleSaveEdit', metadata: { tagId } });
      }

      await fetchTags();
      setEditingTag(null);
      setEditingName('');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, {
        component: 'TagsManagementPage',
        action: 'handleSaveEdit',
        metadata: { tagId }
      });
      showErrorToast('Failed to update tag');
    }
  };

  const handleDeleteTag = async (tagId: string, tagName: string, usageCount: number) => {
    const confirmMsg = usageCount > 0
      ? `This tag "${tagName}" is used on ${usageCount} items. All associations will be removed. Continue?`
      : `Delete tag "${tagName}"?`;

    const confirmed = await confirm(confirmMsg, {
      title: 'Delete Tag',
      variant: 'destructive',
      confirmText: 'Delete',
    });
    if (!confirmed) return;

    try {
      await supabase
        .from('item_tags')
        .delete()
        .eq('tag_id', tagId);

      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      if (user?.id) {
        await tryLogAdminAction({
          p_action_type: 'DELETE',
          p_table_name: 'tags',
          p_record_id: tagId,
          p_old_values: { name: tagName, usage_count: usageCount },
          p_description: `Deleted tag "${tagName}"${usageCount > 0 ? ` (removed from ${usageCount} items)` : ''}`,
        }, { component: 'TagsManagementPage', action: 'handleDeleteTag', metadata: { tagId } });
      }

      await fetchTags();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, {
        component: 'TagsManagementPage',
        action: 'handleDeleteTag',
        metadata: { tagId }
      });
      showErrorToast('Failed to delete tag');
    }
  };

  const filteredTags = useMemo(() =>
    tags.filter(tag =>
      tag.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      tag.user_email?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    ),
    [tags, debouncedSearchQuery]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink dark:text-ink-on-dark">Tag Management</h1>
          <p className="text-secondary-ink dark:text-muted-ink-on-dark mt-1">View, edit, and manage all user tags</p>
        </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark" />
            <input
              type="text"
              placeholder="Search tags by name or user email..."
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
                    Tag Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card-light dark:bg-card-dark divide-y divide-divider dark:divide-divider-on-dark">
                {filteredTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-subtle/50 dark:hover:bg-subtle-on-dark/30 transition">
                    <td className="px-6 py-6">
                      {editingTag === tag.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-3 py-1 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-ink-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(tag.id)}
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
                          <Tag className="h-4 w-4 text-accent-gold" />
                          <span className="text-sm font-medium text-ink dark:text-ink-on-dark">
                            {tag.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-ink dark:text-muted-ink-on-dark" />
                        <span className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                          {tag.user_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tag.usage_count === 0
                          ? 'bg-subtle dark:bg-subtle-on-dark text-muted-ink dark:text-muted-ink-on-dark'
                          : 'bg-accent-gold-soft text-ink dark:text-muted-ink-on-dark'
                      }`}>
                        {tag.usage_count} {tag.usage_count === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      {editingTag !== tag.id && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleStartEdit(tag)}
                            className="p-2 text-accent-gold hover:opacity-80 hover:bg-subtle dark:hover:bg-subtle-on-dark transition"
                            title="Edit tag name"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id, tag.name, tag.usage_count || 0)}
                            className="p-2 text-red-600 dark:text-red-400 hover:opacity-80 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                            title="Delete tag"
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

            {filteredTags.length === 0 && (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4" />
                <p className="text-muted-ink dark:text-muted-ink-on-dark">
                  {searchQuery ? 'No tags found matching your search' : 'No tags found'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-divider dark:border-divider-on-dark">
          <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
            Total: {filteredTags.length} tags
          </p>
        </div>
      </div>
      {ConfirmModal}
    </div>
  );
});
