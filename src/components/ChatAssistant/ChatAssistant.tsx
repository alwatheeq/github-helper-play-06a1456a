import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../Toast/Toast';
import { supabase } from '../../lib/supabase';
import { handleApiError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';

interface ChatAssistantProps {
  summaryText: string;
  originalText?: string;
  topics?: string[];
  medicalMode?: boolean;
  contextType?: 'summary' | 'library_item' | 'history_item' | 'shared';
  contextId?: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  summaryText,
  originalText,
  topics = [],
  medicalMode = false,
  contextType = 'summary',
  contextId = null
}) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { error: showErrorToast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestedQuestions] = useState([
    t('chat.suggestions.explain_summary'),
    t('chat.suggestions.key_points'),
    t('chat.suggestions.study_focus'),
    t('chat.suggestions.simplify')
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load existing conversation on mount if contextId is provided
  useEffect(() => {
    if (contextId && isOpen && !conversationId && user) {
      loadExistingConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextId, isOpen, conversationId, user, contextType]);

  // Load conversation history if conversationId exists
  useEffect(() => {
    if (conversationId && isOpen) {
      loadConversationHistory();
    }
  }, [conversationId, isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadExistingConversation = async () => {
    if (!contextId || !user) return;

    try {
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('context_type', contextType)
        .eq('context_id', contextId)
        .maybeSingle();

      if (error) {
        ErrorLogger.error(error as Error, {
          component: 'ChatAssistant',
          action: 'loadExistingConversation'
        });
        return;
      }

      if (data) {
        setConversationId(data.id);
      }
    } catch (error) {
      ErrorLogger.error(error as Error, {
        component: 'ChatAssistant',
        action: 'loadExistingConversation'
      });
    }
  };

  const loadConversationHistory = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(data);
      }
    } catch (error) {
      ErrorLogger.error(error as Error, {
        component: 'ChatAssistant',
        action: 'loadConversationHistory'
      });
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage
    };
    setMessages(prev => [...prev, tempUserMessage]);
    setLoading(true);

    try {
      if (isOffline()) {
        handleOfflineError(showErrorToast);
        setMessages(prev => prev.slice(0, -1)); // Remove temp message
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: conversationId,
          summary_text: summaryText,
          original_text: originalText || null,
          topics: topics || [],
          medical_mode: medicalMode || false,
          context_type: contextType,
          context_id: contextId
        })
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Handle insufficient credits error (429)
        if (response.status === 429) {
          // Trigger credit balance refresh
          window.dispatchEvent(new CustomEvent('creditUpdated'));
          throw new Error(errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Remove temp message and add real messages
      setMessages(prev => {
        const withoutTemp = prev.filter(m => !m.id.startsWith('temp-'));
        return [
          ...withoutTemp,
          {
            id: `user-${Date.now()}`,
            role: 'user',
            content: userMessage
          },
          {
            id: data.message_id || `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.message
          }
        ];
      });

      // Update conversation ID if this was a new conversation
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      // Trigger credit balance refresh after successful message
      window.dispatchEvent(new CustomEvent('creditUpdated'));

    } catch (error) {
      ErrorLogger.error(error as Error, {
        component: 'ChatAssistant',
        action: 'sendMessage'
      });
      
      const errorMessage = error instanceof TypeError && error.message.includes('fetch')
        ? "Cannot reach the AI assistant. Check your connection and that the app's Supabase URL is correct."
        : handleApiError(error, {
            component: 'ChatAssistant',
            action: 'sendMessage'
          });
      showErrorToast(errorMessage);
      
      // Remove temp message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-[46px] h-[46px] rounded-[14px] flex items-center justify-center hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #b45309, #d97706)', boxShadow: '0 4px 18px rgba(180,83,9,0.4)' }}
        aria-label={t('chat.open_assistant')}
      >
        <MessageCircle className="h-5 w-5 text-white" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-[360px] ${isMinimized ? 'h-16' : 'h-[520px]'} flex flex-col bg-card-light dark:bg-card-dark rounded-[18px] shadow-[0_12px_48px_rgba(0,0,0,0.18)] border border-divider dark:border-divider-on-dark overflow-hidden`}>
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-[18px] py-[14px] rounded-t-[18px] flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}
      >
        <div className="w-[34px] h-[34px] rounded-[10px] bg-white/20 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-white">{t('chat.assistant_title')}</div>
          <div className="text-[10px] text-white/[0.75] mt-[1px]">Powered by Claude · Always learning</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-[26px] h-[26px] rounded-[7px] bg-white/15 flex items-center justify-center hover:opacity-80 transition-opacity"
            aria-label={isMinimized ? t('chat.maximize') : t('chat.minimize')}
          >
            {isMinimized ? <Maximize2 className="h-3 w-3 text-white" /> : <Minimize2 className="h-3 w-3 text-white" />}
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setIsMinimized(false);
            }}
            className="w-[26px] h-[26px] rounded-[7px] bg-white/15 flex items-center justify-center hover:opacity-80 transition-opacity"
            aria-label={t('chat.close')}
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3.5 flex flex-col gap-2.5 bg-page-light dark:bg-page-dark">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 text-muted-ink dark:text-muted-ink-on-dark" />
                <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark mb-4">{t('chat.welcome_message')}</p>
                <div className="flex flex-col gap-1.5">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(question)}
                      className="w-full text-left px-3.5 py-2 text-[10px] font-semibold rounded-[14px] border border-divider dark:border-divider-on-dark bg-subtle dark:bg-subtle-on-dark text-muted-ink dark:text-muted-ink-on-dark hover:opacity-80 transition-opacity"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-[26px] h-[26px] rounded-[8px] flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}>
                        <MessageCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] px-3 py-2.5 text-[12px] leading-relaxed whitespace-pre-line ${
                        message.role === 'user'
                          ? 'text-white'
                          : 'bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark border border-divider dark:border-divider-on-dark'
                      }`}
                      style={{
                        borderRadius: message.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: message.role === 'user' ? 'linear-gradient(135deg, #d97706, #b45309dd)' : undefined,
                        boxShadow: message.role === 'user' ? '0 2px 8px rgba(180,83,9,0.4)' : '0 1px 4px rgba(0,0,0,0.06)',
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-card-light dark:bg-card-dark px-3 py-2.5 border border-divider dark:border-divider-on-dark" style={{ borderRadius: '14px 14px 14px 4px' }}>
                      <Loader2 className="h-4 w-4 animate-spin text-muted-ink dark:text-muted-ink-on-dark" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Suggestions */}
          {messages.length > 0 && (
            <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-t border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark flex-shrink-0">
              {suggestedQuestions.slice(0, 3).map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className="px-2.5 py-1.5 rounded-[14px] bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark text-[10px] font-semibold text-muted-ink dark:text-muted-ink-on-dark hover:opacity-80 transition-opacity whitespace-nowrap flex-shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2.5 flex items-center gap-2 bg-card-light dark:bg-card-dark border-t border-divider dark:border-divider-on-dark flex-shrink-0">
            <div className="flex-1 bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark rounded-[20px] px-3.5 py-2 text-[12px] text-muted-ink dark:text-muted-ink-on-dark">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chat.input_placeholder')}
                className="w-full bg-transparent text-ink dark:text-ink-on-dark focus:outline-none resize-none text-[12px] leading-relaxed placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark"
                rows={1}
                style={{ minHeight: '20px', maxHeight: '80px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || loading}
              className="w-8 h-8 rounded-[9px] bg-accent-gold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex-shrink-0"
              style={{ boxShadow: '0 2px 8px rgba(180,83,9,0.4)' }}
              aria-label={t('chat.send')}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              ) : (
                <Send className="h-3.5 w-3.5 text-white" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

