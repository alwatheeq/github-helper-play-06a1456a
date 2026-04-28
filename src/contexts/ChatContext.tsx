import React, { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';
import { useChatStore } from '../stores/useChatStore';
import type { ChatContextData, ChatContextType } from '../stores/useChatStore';

export type { ChatContextData, ChatContextType };

interface ChatContextValue {
  context: ChatContextData;
  setChatContext: (data: Partial<ChatContextData>) => void;
  clearChatContext: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Subscribe to individual fields so the context object reference is stable
  // when unrelated store state changes, and so callbacks don't change identity.
  const summaryText = useChatStore((s) => s.summaryText);
  const originalText = useChatStore((s) => s.originalText);
  const topics = useChatStore((s) => s.topics);
  const medicalMode = useChatStore((s) => s.medicalMode);
  const contextType = useChatStore((s) => s.contextType);
  const contextId = useChatStore((s) => s.contextId);

  const context = useMemo<ChatContextData>(
    () => ({ summaryText, originalText, topics, medicalMode, contextType, contextId }),
    [summaryText, originalText, topics, medicalMode, contextType, contextId]
  );

  // Use store API methods directly — they have stable identity across renders.
  const setChatContext = useCallback((data: Partial<ChatContextData>) => {
    useChatStore.getState().setChatContext(data);
  }, []);

  const clearChatContext = useCallback(() => {
    useChatStore.getState().clearChatContext();
  }, []);

  const value = useMemo(
    () => ({ context, setChatContext, clearChatContext }),
    [context, setChatContext, clearChatContext]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = (): ChatContextValue => {
  const contextValue = useContext(ChatContext);
  if (!contextValue) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return contextValue;
};
