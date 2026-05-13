import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, UserPlus, Check, X, Loader2 } from 'lucide-react';

import { useI18n } from '../../../contexts/I18nContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../Toast/Toast';
import { supabase } from '../../../lib/supabase';
import { toErrorMessage } from '../../../utils/errorHandler';

interface UserProfile {
  id: string;
  display_name: string | null;
  username: string | null;
}

interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  requester: UserProfile;
  addressee: UserProfile;
}

export const FriendsPanel: React.FC = () => {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingIncoming, setPendingIncoming] = useState<FriendshipRow[]>([]);
  const [friends, setFriends] = useState<FriendshipRow[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchGenRef = useRef(0);

  const fetchFriendships = useCallback(
    async (gen: number) => {
      if (!user) {
        setLoadingFriends(false);
        return;
      }

      setLoadingFriends(true);

      try {
        const [incomingRes, friendsRes] = await Promise.all([
          supabase
            .from('user_friendships')
            .select('id, requester_id, addressee_id, status, created_at')
            .eq('addressee_id', user.id)
            .eq('status', 'pending'),
          supabase
            .from('user_friendships')
            .select('id, requester_id, addressee_id, status, created_at')
            .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
            .eq('status', 'accepted'),
        ]);

        if (gen !== fetchGenRef.current) return;

        if (incomingRes.error || friendsRes.error) {
          showError(toErrorMessage(incomingRes.error ?? friendsRes.error));
          return;
        }

        const inc = incomingRes.data ?? [];
        const fr = friendsRes.data ?? [];

        const ids = new Set<string>();
        for (const r of inc) {
          ids.add(r.requester_id);
          ids.add(r.addressee_id);
        }
        for (const r of fr) {
          ids.add(r.requester_id);
          ids.add(r.addressee_id);
        }
        const idList = [...ids];

        const profileMap: Record<string, UserProfile> = {};
        if (idList.length > 0) {
          const { data: profs, error: pErr } = await supabase
            .from('user_profiles')
            .select('id, display_name, username')
            .in('id', idList);

          if (gen !== fetchGenRef.current) return;

          if (pErr) {
            showError(toErrorMessage(pErr));
            return;
          }
          for (const p of profs ?? []) {
            profileMap[p.id] = p as UserProfile;
          }
        }

        if (gen !== fetchGenRef.current) return;

        const enrich = (
          rows: Array<{
            id: string;
            requester_id: string;
            addressee_id: string;
            status: string;
            created_at: string;
          }>
        ): FriendshipRow[] =>
          rows.map((r) => ({
            ...r,
            requester:
              profileMap[r.requester_id] ?? {
                id: r.requester_id,
                display_name: null,
                username: null,
              },
            addressee:
              profileMap[r.addressee_id] ?? {
                id: r.addressee_id,
                display_name: null,
                username: null,
              },
          }));

        setPendingIncoming(enrich(inc));
        setFriends(enrich(fr));
      } finally {
        if (gen === fetchGenRef.current) {
          setLoadingFriends(false);
        }
      }
    },
    [user, showError]
  );

  useEffect(() => {
    const gen = ++fetchGenRef.current;
    void fetchFriendships(gen);
    return () => {
      fetchGenRef.current += 1;
    };
  }, [fetchFriendships]);

  const searchUsers = useCallback(
    async (query: string) => {
      if (!user || query.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const { data, error } = await supabase.rpc('search_users_by_username', {
        p_query: query.trim(),
      });

      setIsSearching(false);

      if (error) {
        showError(toErrorMessage(error));
        return;
      }

      setSearchResults((data ?? []) as UserProfile[]);
    },
    [user, showError],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => searchUsers(value), 300);
  };

  const sendFriendRequest = async (targetId: string) => {
    if (!user) return;

    setSendingRequest(targetId);
    const { error } = await supabase
      .from('user_friendships')
      .insert({ requester_id: user.id, addressee_id: targetId, status: 'pending' });

    setSendingRequest(null);

    if (error) {
      showError(toErrorMessage(error));
      return;
    }

    showSuccess(t('social.add_friend'));
    setSearchResults((prev) => prev.filter((u) => u.id !== targetId));
  };

  const handleRequest = async (friendshipId: string, action: 'accepted' | 'rejected') => {
    setProcessingRequest(friendshipId);
    const { error } = await supabase
      .from('user_friendships')
      .update({ status: action })
      .eq('id', friendshipId);

    setProcessingRequest(null);

    if (error) {
      showError(toErrorMessage(error));
      return;
    }

    void fetchFriendships(++fetchGenRef.current);
  };

  const getFriendProfile = (row: FriendshipRow): UserProfile => {
    if (!user) return row.requester;
    return row.requester_id === user.id ? row.addressee : row.requester;
  };

  const Avatar: React.FC<{ name: string | null; size?: string }> = ({ name, size = 'h-10 w-10' }) => (
    <div className={`${size} rounded-full bg-sidebar flex items-center justify-center text-ink-on-dark font-bold text-sm shrink-0`}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );

  return (
    <div dir={dir} className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">

      {/* LEFT — search + friend list */}
      <div>
        {/* Search bar */}
        <div className="flex items-center gap-3 px-[14px] py-[9px] bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark mb-3">
          <Search className="h-4 w-4 text-muted-ink dark:text-muted-ink-on-dark flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('social.search_friends')}
            className="flex-1 bg-transparent text-[13px] text-ink dark:text-ink-on-dark placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark focus:outline-none"
          />
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-ink dark:text-muted-ink-on-dark flex-shrink-0" />}
        </div>

        {/* Search results */}
        {(searchResults.length > 0 || (searchQuery.trim().length >= 2 && !isSearching)) && (
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-accent-gold">Results</span>
              <div className="flex-1 h-px bg-divider dark:bg-divider-on-dark" />
            </div>
            {searchResults.length > 0 ? (
              <div className="space-y-0 divide-y divide-divider dark:divide-divider-on-dark">
                {searchResults.map((profile) => (
                  <div key={profile.id} className="flex items-center gap-[14px] py-3">
                    <Avatar name={profile.display_name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-[14.5px] font-semibold text-ink dark:text-ink-on-dark truncate">
                        {profile.display_name || profile.username}
                      </p>
                      {profile.username && (
                        <p className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">@{profile.username}</p>
                      )}
                    </div>
                    <button
                      onClick={() => sendFriendRequest(profile.id)}
                      disabled={sendingRequest === profile.id}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold text-ink-on-dark bg-accent-gold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {sendingRequest === profile.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                      {t('social.add_friend')}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-center py-4 text-muted-ink dark:text-muted-ink-on-dark">{t('social.no_results')}</p>
            )}
          </div>
        )}

        {/* Active friends section */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-accent-gold">{t('social.friends_list')}</span>
          {!loadingFriends && <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">· {friends.length}</span>}
          <div className="flex-1 h-px bg-divider dark:bg-divider-on-dark" />
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-ink dark:text-muted-ink-on-dark" />
          </div>
        ) : friends.length === 0 ? (
          <p className="text-[12px] text-center py-8 text-muted-ink dark:text-muted-ink-on-dark">{t('social.no_friends')}</p>
        ) : (
          <div className="divide-y divide-divider dark:divide-divider-on-dark">
            {friends.map((row) => {
              const profile = getFriendProfile(row);
              return (
                <div key={row.id} className="flex items-center gap-[14px] py-3.5">
                  {/* Avatar with online dot */}
                  <div className="relative flex-shrink-0">
                    <div className="h-[42px] w-[42px] rounded-full bg-sidebar flex items-center justify-center text-ink-on-dark font-bold text-[15px]">
                      {(profile.display_name || profile.username || '?')[0].toUpperCase()}
                    </div>
                    <span className="absolute bottom-0.5 right-0.5 w-[11px] h-[11px] rounded-full bg-accent-gold border-2 border-page dark:border-page" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[14.5px] font-semibold text-ink dark:text-ink-on-dark truncate">
                      {profile.display_name || profile.username}
                    </p>
                    {profile.username && (
                      <p className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">@{profile.username}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT rail */}
      <div className="flex flex-col gap-[14px]">

        {/* Add a Friend card */}
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-4">
          <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-accent-gold mb-3">
            {t('social.add_friend')}
          </p>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('social.search_friends')}
            className="w-full px-3 py-2 mb-3 border border-divider dark:border-divider-on-dark bg-subtle dark:bg-card-dark text-[12px] text-ink dark:text-ink-on-dark placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark focus:outline-none"
          />
          <button className="w-full py-2 bg-accent-gold text-ink-on-dark text-[12px] font-bold hover:opacity-90 transition-opacity">
            {t('social.add_friend')}
          </button>
        </div>

        {/* Pending Requests */}
        {pendingIncoming.length > 0 && (
          <div className="bg-sidebar p-4">
            <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-accent-gold mb-3">
              {t('social.pending_requests')} · {pendingIncoming.length}
            </p>
            <div className="space-y-3">
              {pendingIncoming.map((req) => {
                const profile = req.requester;
                return (
                  <div key={req.id}>
                    <div className="flex items-center gap-[10px] mb-3">
                      <div className="w-8 h-8 rounded-full bg-accent-gold flex items-center justify-center text-[12px] font-bold text-ink-on-dark flex-shrink-0">
                        {(profile.display_name || profile.username || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-ink-on-dark dark:text-ink-on-dark truncate">
                          {profile.display_name || profile.username}
                        </p>
                        {profile.username && (
                          <p className="text-[10px] text-muted-ink-on-dark">@{profile.username}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-[7px]">
                      <button
                        onClick={() => handleRequest(req.id, 'accepted')}
                        disabled={processingRequest === req.id}
                        className="flex-1 py-1.5 bg-accent-gold text-ink-on-dark text-[11px] font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1"
                        aria-label={t('social.accept')}
                      >
                        {processingRequest === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        {t('social.accept')}
                      </button>
                      <button
                        onClick={() => handleRequest(req.id, 'rejected')}
                        disabled={processingRequest === req.id}
                        className="flex-1 py-1.5 border border-white/20 text-white/60 text-[11px] hover:bg-white/10 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                        aria-label={t('social.reject')}
                      >
                        <X className="h-3.5 w-3.5" />
                        {t('social.reject')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
