import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Hash, Crown, Trash2, Copy, Check } from 'lucide-react';

const AVATAR_PAL = ['bg-accent-gold', 'bg-secondary-ink', 'bg-sidebar', 'bg-muted-ink'] as const;
import { QRCodeSVG } from 'qrcode.react';
import { useI18n } from '../../../contexts/I18nContext';

import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../Toast/Toast';
import { supabase } from '../../../lib/supabase';
import { toErrorMessage } from '../../../utils/errorHandler';

interface GroupMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  username: string | null;
  display_name: string | null;
}

interface StudyGroup {
  id: string;
  name: string;
  group_code: string;
  created_by: string;
  created_at: string;
  member_count: number;
  my_role: 'admin' | 'member';
}

interface GroupsPanelProps {
  onOpenGroupChat: (groupId: string, groupName: string) => void;
}

export const GroupsPanel: React.FC<GroupsPanelProps> = ({ onOpenGroupChat }) => {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useToast();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, GroupMember[]>>({});
  const [loadingMembers, setLoadingMembers] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const loadGenRef = useRef(0);

  const loadGroups = useCallback(
    async (gen: number) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data: memberships, error: memErr } = await supabase
          .from('study_group_members')
          .select('group_id, role')
          .eq('user_id', user.id);

        if (gen !== loadGenRef.current) return;

        if (memErr) throw memErr;
        if (!memberships || memberships.length === 0) {
          setGroups([]);
          return;
        }

        const groupIds = memberships.map((m) => m.group_id);
        const roleMap = Object.fromEntries(memberships.map((m) => [m.group_id, m.role]));

        const { data: groupData, error: grpErr } = await supabase
          .from('study_groups')
          .select('id, name, group_code, created_by, created_at')
          .in('id', groupIds);

        if (gen !== loadGenRef.current) return;

        if (grpErr) throw grpErr;

        const { data: counts, error: cntErr } = await supabase
          .from('study_group_members')
          .select('group_id')
          .in('group_id', groupIds);

        if (gen !== loadGenRef.current) return;

        if (cntErr) throw cntErr;

        const countMap: Record<string, number> = {};
        (counts || []).forEach((c) => {
          countMap[c.group_id] = (countMap[c.group_id] || 0) + 1;
        });

        const mapped: StudyGroup[] = (groupData || []).map((g) => ({
          ...g,
          member_count: countMap[g.id] || 0,
          my_role: roleMap[g.id] as 'admin' | 'member',
        }));

        if (gen !== loadGenRef.current) return;

        setGroups(mapped);
      } catch (err) {
        if (gen === loadGenRef.current) {
          showError(toErrorMessage(err));
        }
      } finally {
        if (gen === loadGenRef.current) {
          setLoading(false);
        }
      }
    },
    [user, showError]
  );

  const reloadGroups = useCallback(async () => {
    const gen = ++loadGenRef.current;
    await loadGroups(gen);
  }, [loadGroups]);

  useEffect(() => {
    const gen = ++loadGenRef.current;
    void loadGroups(gen);
    return () => {
      loadGenRef.current += 1;
    };
  }, [loadGroups]);

  const handleCreate = async () => {
    if (!user) return;
    const name = newGroupName.trim();
    if (!name) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .insert({ name, created_by: user.id })
        .select('id')
        .single();

      if (error) throw error;

      const { error: memberErr } = await supabase
        .from('study_group_members')
        .insert({ group_id: data.id, user_id: user.id, role: 'admin' });

      if (memberErr) throw memberErr;

      setNewGroupName('');
      await reloadGroups();
      showSuccess(t('social.create_group') + ' ✓');
    } catch (err) {
      showError(toErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!user) return;
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length !== 6) return;

    setJoining(true);
    try {
      const { data: group, error: findErr } = await supabase
        .from('study_groups')
        .select('id')
        .eq('group_code', code)
        .single();

      if (findErr || !group) {
        showError(t('social.group_code') + ' — not found');
        return;
      }

      const { error: joinErr } = await supabase
        .from('study_group_members')
        .insert({ group_id: group.id, user_id: user.id, role: 'member' });

      if (joinErr) throw joinErr;

      setJoinCode('');
      await reloadGroups();
      showSuccess(t('social.join_group') + ' ✓');
    } catch (err) {
      showError(toErrorMessage(err));
    } finally {
      setJoining(false);
    }
  };

  const loadMembers = async (groupId: string) => {
    setLoadingMembers(groupId);
    try {
      const { data, error } = await supabase
        .from('study_group_members')
        .select('id, user_id, role, joined_at')
        .eq('group_id', groupId);

      if (error) throw error;

      const userIds = (data || []).map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, username, display_name')
        .in('id', userIds);

      const profileMap = Object.fromEntries(
        (profiles || []).map((p) => [p.id, p])
      );

      const enriched: GroupMember[] = (data || []).map((m) => ({
        ...m,
        username: profileMap[m.user_id]?.username ?? null,
        display_name: profileMap[m.user_id]?.display_name ?? null,
      }));

      setMembers((prev) => ({ ...prev, [groupId]: enriched }));
    } catch (err) {
      showError(toErrorMessage(err));
    } finally {
      setLoadingMembers(null);
    }
  };

  const toggleExpand = (groupId: string) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
    } else {
      setExpandedGroupId(groupId);
      if (!members[groupId]) loadMembers(groupId);
    }
  };

  const handleRemoveMember = async (groupId: string, memberId: string) => {
    try {
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      await loadMembers(groupId);
      await reloadGroups();
    } catch (err) {
      showError(toErrorMessage(err));
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
      setExpandedGroupId(null);
      await reloadGroups();
      showSuccess(t('social.delete_group') + ' ✓');
    } catch (err) {
      showError(toErrorMessage(err));
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div dir={dir} className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-6">

      {/* LEFT — My groups + Discover */}
      <div>
        {/* My Groups section heading */}
        <div className="flex items-center gap-[10px] mb-4">
          <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-accent-gold">{t('social.my_groups')}</span>
          <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">· {groups.length}</span>
          <div className="flex-1 h-px bg-divider dark:bg-divider-on-dark" />
        </div>

        {loading ? (
          <div className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark text-center py-8">...</div>
        ) : groups.length === 0 ? (
          <div className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark text-center py-8">
            {t('social.no_groups')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-8">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark flex flex-col"
              >
                {/* Group card header */}
                <div className={`px-4 py-3 flex justify-between items-center ${group.my_role === 'admin' ? 'bg-sidebar' : 'bg-subtle dark:bg-subtle-on-dark'}`}>
                  <div className="flex items-center gap-2">
                    {/* Mini avatar stack — rotating color palette per design */}
                    <div className="flex">
                      {(() => {
                        const borderCls = group.my_role === 'admin' ? 'border-sidebar' : 'border-subtle dark:border-subtle-on-dark';
                        return Array.from({ length: Math.min(4, group.member_count) }, (_, idx) => (
                          <div
                            key={idx}
                            className={`w-[22px] h-[22px] rounded-full ${AVATAR_PAL[idx % AVATAR_PAL.length]} border-2 ${borderCls}`}
                            style={{ marginLeft: idx > 0 ? -7 : 0, zIndex: 10 - idx }}
                          />
                        ));
                      })()}
                    </div>
                    {group.member_count > 4 && (
                      <span className={`text-[10px] ${group.my_role === 'admin' ? 'text-white/50' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                        +{group.member_count - 4}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] tracking-[1.5px] uppercase font-bold ${group.my_role === 'admin' ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                      {group.my_role === 'admin' ? t('social.admin') : t('social.member')}
                    </span>
                    {group.my_role === 'admin' && <Crown className="w-3 h-3 text-accent-gold" />}
                  </div>
                </div>

                {/* Card body */}
                <button
                  onClick={() => toggleExpand(group.id)}
                  className="px-4 py-[14px] flex-1 text-left"
                >
                  <p className="font-display text-[16px] font-semibold text-ink dark:text-ink-on-dark leading-snug mb-[3px]">
                    {group.name}.
                  </p>
                  <p className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mt-0.5">
                    {group.member_count} members
                  </p>
                </button>

                {/* Card footer */}
                <div className="px-4 py-[10px] border-t border-divider dark:border-divider-on-dark flex items-center justify-between">
                  <div className="flex items-center gap-[5px]">
                    <div className="w-[5px] h-[5px] rounded-full bg-divider dark:bg-divider-on-dark" />
                    <span className="text-[10.5px] text-muted-ink dark:text-muted-ink-on-dark">joined</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenGroupChat(group.id, group.name);
                    }}
                    className="font-display px-[14px] py-[5px] bg-accent-gold text-white text-[11px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    Open group
                  </button>
                </div>

                {/* Expanded content */}
                {expandedGroupId === group.id && (
                  <div className="border-t border-divider dark:border-divider-on-dark px-4 pb-4 pt-3 space-y-4">
                    {/* Group code + QR */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark mb-1">{t('social.group_code')}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[18px] font-bold tracking-widest text-ink dark:text-ink-on-dark">
                            {group.group_code}
                          </span>
                          <button
                            onClick={() => copyCode(group.group_code)}
                            className="p-1.5 bg-subtle dark:bg-card-dark transition-colors"
                            title={t('social.copy_code')}
                          >
                            {copiedCode === group.group_code ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-muted-ink dark:text-muted-ink-on-dark" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="bg-card-light dark:bg-card-dark p-2">
                        <QRCodeSVG value={group.group_code} size={56} />
                      </div>
                    </div>

                    {/* Members list */}
                    <div>
                      <p className="text-[10px] font-semibold text-ink dark:text-ink-on-dark mb-2">
                        {t('social.members')} ({group.member_count})
                      </p>
                      {loadingMembers === group.id ? (
                        <p className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark py-2">...</p>
                      ) : (
                        <div className="space-y-1.5">
                          {(members[group.id] || []).map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center justify-between py-1.5 px-2.5 text-[11px] bg-subtle dark:bg-card-dark"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-accent-gold flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                  {(m.username || m.display_name || '?')[0].toUpperCase()}
                                </div>
                                <span className="truncate text-ink dark:text-ink-on-dark">
                                  {m.username || m.display_name || m.user_id.slice(0, 8)}
                                </span>
                                {m.role === 'admin' && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                              </div>
                              {group.my_role === 'admin' && m.role !== 'admin' && (
                                <button
                                  onClick={() => handleRemoveMember(group.id, m.id)}
                                  className="text-red-400 hover:text-red-500 p-1 transition-colors"
                                  title={t('social.remove_member')}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Admin delete */}
                    {group.my_role === 'admin' && (
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('social.delete_group')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT rail */}
      <div className="flex flex-col gap-4">

        {/* Start a Group CTA — dark panel */}
        <div className="bg-sidebar py-[20px] px-[18px]">
          <p className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-[10px]">
            Start a Group
          </p>
          <p className="font-display text-[15px] text-ink-on-dark leading-[1.55] mb-[14px]">
            Gather your study circle — invite peers by course or name.
          </p>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder={t('social.group_name')}
            maxLength={100}
            className="w-full px-3 py-2 mb-3 border border-white/20 bg-white/10 text-[12px] text-white placeholder:text-white/40 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newGroupName.trim()}
            className="w-full py-[9px] bg-accent-gold text-white text-[12px] font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {creating ? '…' : 'Create Group →'}
          </button>
        </div>

        {/* Join by code */}
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark py-[14px] px-4">
          <p className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-3 flex items-center gap-2">
            <Hash className="w-3 h-3" />
            Join by Code
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder={t('social.group_code')}
              maxLength={6}
              className="flex-1 px-3 py-2 border border-divider dark:border-divider-on-dark bg-page-light dark:bg-page-dark text-[12px] font-mono tracking-widest uppercase text-ink dark:text-ink-on-dark focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            <button
              onClick={handleJoin}
              disabled={joining || joinCode.trim().length !== 6}
              className="px-3 py-2 bg-accent-gold text-white text-[12px] font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {joining ? '…' : 'Join'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
