import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Loader2, Paperclip, Smile } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../Toast/Toast';
import { supabase } from '../../../lib/supabase';
import { toErrorMessage } from '../../../utils/errorHandler';

interface ChatMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_username: string | null;
  sender_display_name: string | null;
}

interface GroupChatProps {
  groupId: string;
  groupName: string;
  onBack: () => void;
}

const PAGE_SIZE = 50;

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export const GroupChat: React.FC<GroupChatProps> = ({ groupId, groupName, onBack }) => {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const { error: showError } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const profileCacheRef = useRef<Record<string, { username: string | null; display_name: string | null }>>({});

  const enrichWithProfiles = useCallback(
    async (
      rawMessages: Array<{ id: string; group_id: string; sender_id: string; content: string; created_at: string }>
    ): Promise<ChatMessage[]> => {
      const cache = profileCacheRef.current;
      const uncachedIds = [...new Set(rawMessages.map((m) => m.sender_id))].filter((id) => !cache[id]);

      if (uncachedIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, username, display_name')
          .in('id', uncachedIds);

        (profiles || []).forEach((p) => {
          cache[p.id] = { username: p.username, display_name: p.display_name };
        });
      }

      return rawMessages.map((m) => ({
        ...m,
        sender_username: cache[m.sender_id]?.username ?? null,
        sender_display_name: cache[m.sender_id]?.display_name ?? null,
      }));
    },
    []
  );

  const loadInitialMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select('id, group_id, sender_id, content, created_at')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      const reversed = (data || []).reverse();
      const enriched = await enrichWithProfiles(reversed);
      setMessages(enriched);
      setHasMore((data || []).length === PAGE_SIZE);
    } catch (err) {
      showError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [groupId, enrichWithProfiles, showError]);

  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('group-chat-' + groupId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: 'group_id=eq.' + groupId,
        },
        async (payload) => {
          const newMsg = payload.new as {
            id: string;
            group_id: string;
            sender_id: string;
            content: string;
            created_at: string;
          };
          const enriched = await enrichWithProfiles([newMsg]);
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, enriched[0]];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, enrichWithProfiles]);

  const loadOlderMessages = async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);

    const oldestCreatedAt = messages[0].created_at;
    const container = scrollContainerRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;

    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select('id, group_id, sender_id, content, created_at')
        .eq('group_id', groupId)
        .lt('created_at', oldestCreatedAt)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      const reversed = (data || []).reverse();
      const enriched = await enrichWithProfiles(reversed);
      setMessages((prev) => [...enriched, ...prev]);
      setHasMore((data || []).length === PAGE_SIZE);

      // Preserve scroll position after prepending
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    } catch (err) {
      showError(toErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    if (!user || sending) return;
    const content = input.trim();
    if (!content) return;

    setSending(true);
    setInput('');
    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({ group_id: groupId, sender_id: user.id, content });

      if (error) throw error;
    } catch (err) {
      showError(toErrorMessage(err));
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (container.scrollTop < 60) {
      loadOlderMessages();
    }
  };

  const senderLabel = (msg: ChatMessage) =>
    msg.sender_username || msg.sender_display_name || msg.sender_id.slice(0, 8);

  const senderInitial = (msg: ChatMessage) =>
    (msg.sender_username || msg.sender_display_name || '?')[0].toUpperCase();

  const isOwn = (msg: ChatMessage) => msg.sender_id === user?.id;

  return (
    <div dir={dir} className="flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: 480 }}>

      {/* Header — GroupChat4 */}
      <div
        className="flex items-center gap-3 px-[18px] shrink-0 bg-card-light dark:bg-card-dark border-b border-divider dark:border-divider-on-dark"
        style={{ height: 58, boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}
      >
        <button
          onClick={onBack}
          className="p-1.5 rounded-[7px] bg-subtle dark:bg-subtle-on-dark hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5 text-ink dark:text-ink-on-dark" />
        </button>
        {/* Group avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="flex items-center justify-center text-[15px] font-bold text-white"
            style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'linear-gradient(140deg, var(--color-accent-gold), color-mix(in srgb, var(--color-accent-gold) 60%, transparent))',
              boxShadow: '0 3px 10px color-mix(in srgb, var(--color-accent-gold) 27%, transparent)',
            }}
          >
            {groupName[0]?.toUpperCase()}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card-light dark:border-card-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-bold text-ink dark:text-ink-on-dark truncate leading-tight">{groupName}</h2>
          <p className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mt-[1px]">Group chat</p>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 bg-page-light dark:bg-page-dark dark:bg-page-light dark:bg-page-dark flex flex-col gap-1"
        style={{
          backgroundImage: 'radial-gradient(var(--color-border-divider, #e5e7eb) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16 flex-1">
            <Loader2 className="w-6 h-6 animate-spin text-muted-ink dark:text-muted-ink-on-dark" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-[13px] text-center py-16 flex-1 text-muted-ink dark:text-muted-ink-on-dark">
            {t('social.no_messages')}
          </div>
        ) : (
          <>
            {hasMore && (
              <button
                onClick={loadOlderMessages}
                disabled={loadingMore}
                className="self-center px-4 py-1.5 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-full text-[11px] text-muted-ink dark:text-muted-ink-on-dark hover:opacity-80 transition-opacity mb-2"
              >
                {loadingMore ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : t('social.load_more')}
              </button>
            )}

            {/* Date chip */}
            <div className="flex justify-center mb-4">
              <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-full px-4 py-1 text-[9px] font-bold text-muted-ink dark:text-muted-ink-on-dark tracking-widest uppercase">
                Today
              </div>
            </div>

            {messages.map((msg, i) => {
              const own = isOwn(msg);
              const prevMsg = i > 0 ? messages[i - 1] : null;
              const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;
              const isFirst = !prevMsg || prevMsg.sender_id !== msg.sender_id;
              const isLast = !nextMsg || nextMsg.sender_id !== msg.sender_id;

              // Bubble border radii — grouped style from GroupChat4
              const rOther = `${isFirst ? 4 : 4}px 18px ${isLast ? 18 : 6}px ${isFirst ? 18 : 4}px`;
              const rOwn = `18px ${isFirst ? 4 : 4}px ${isFirst ? 6 : 18}px 18px`;

              return (
                <div
                  key={msg.id}
                  className={`flex ${own ? 'flex-row-reverse' : 'flex-row'} items-end gap-2.5`}
                  style={{ marginBottom: isLast ? 14 : 3 }}
                >
                  {/* Avatar column — 34px fixed width for alignment */}
                  <div className="w-8 flex-shrink-0">
                    {!own && isFirst && (
                      <div
                        className="flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                        style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--color-accent-gold)', boxShadow: '0 2px 8px color-mix(in srgb, var(--color-accent-gold) 27%, transparent)' }}
                      >
                        {senderInitial(msg)}
                      </div>
                    )}
                  </div>

                  {/* Message column */}
                  <div className={`max-w-[66%] flex flex-col ${own ? 'items-end' : 'items-start'}`}>
                    {/* Name + time — only on first bubble of a group */}
                    {!own && isFirst && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-accent-gold">{senderLabel(msg)}</span>
                        <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">{relativeTime(msg.created_at)}</span>
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`text-[13px] leading-[1.65] break-words ${
                        own
                          ? 'bg-accent-gold text-ink-on-dark'
                          : 'bg-card-light dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark'
                      }`}
                      style={{
                        padding: '10px 14px',
                        borderRadius: own ? rOwn : rOther,
                        boxShadow: own
                          ? '0 3px 14px color-mix(in srgb, var(--color-accent-gold) 22%, transparent)'
                          : '0 1px 5px rgba(0,0,0,0.08)',
                      }}
                    >
                      {msg.content}
                    </div>

                    {/* Time — own messages only, last in group */}
                    {own && isLast && (
                      <span className="text-[9px] text-muted-ink dark:text-muted-ink-on-dark mt-1">
                        {relativeTime(msg.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input bar — GroupChat4 */}
      <div className="shrink-0 border-t border-divider dark:border-divider-on-dark px-[18px] py-[10px] bg-card-light dark:bg-card-dark flex items-center gap-2" style={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        {/* Attachment icon */}
        <button className="flex-shrink-0 flex items-center justify-center text-muted-ink dark:text-muted-ink-on-dark hover:opacity-80 transition-opacity bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark" style={{ width: 32, height: 32, borderRadius: 8 }}>
          <Paperclip className="w-3.5 h-3.5" />
        </button>
        {/* Emoji icon */}
        <button className="flex-shrink-0 flex items-center justify-center text-muted-ink dark:text-muted-ink-on-dark hover:opacity-80 transition-opacity bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark" style={{ width: 32, height: 32, borderRadius: 8 }}>
          <Smile className="w-3.5 h-3.5" />
        </button>
        {/* Text input — pill shape */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={t('social.type_message')}
          className="flex-1 text-[13px] border-[1.5px] border-divider dark:border-divider-on-dark bg-page-light dark:bg-page-dark text-ink dark:text-ink-on-dark placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark focus:outline-none"
          style={{ borderRadius: 24, padding: '9px 18px' }}
        />
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="flex items-center justify-center flex-shrink-0 bg-accent-gold hover:opacity-90 disabled:opacity-40 transition-opacity"
          style={{ width: 38, height: 38, borderRadius: 11, boxShadow: '0 3px 12px color-mix(in srgb, var(--color-accent-gold) 27%, transparent)' }}
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-3.5 h-3.5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};
