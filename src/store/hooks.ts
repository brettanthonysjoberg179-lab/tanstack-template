import { useStore } from '@tanstack/react-store';
import { v4 as uuidv4 } from 'uuid';
import { actions, selectors, store, type Conversation } from './store';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { Message } from '../utils/ai';
import { useEffect, useCallback, useMemo } from 'react';

// Check if Convex URL is provided - memoized for performance
const isConvexAvailable = Boolean(import.meta.env.VITE_CONVEX_URL);

// Optimized selectors with memoization
const memoizedSelectors = {
  isLoading: (s: any) => selectors.getIsLoading(s),
  conversations: (s: any) => selectors.getConversations(s),
  currentConversationId: (s: any) => selectors.getCurrentConversationId(s),
  prompts: (s: any) => selectors.getPrompts(s),
  currentConversation: (s: any) => selectors.getCurrentConversation(s),
};

// Original app hook that matches the interface expected by the app
export function useAppState() {
  const isLoading = useStore(store, memoizedSelectors.isLoading);
  const conversations = useStore(store, memoizedSelectors.conversations);
  const currentConversationId = useStore(store, memoizedSelectors.currentConversationId);
  const prompts = useStore(store, memoizedSelectors.prompts);
  
  // Memoize action handlers to prevent unnecessary re-renders
  const actionHandlers = useMemo(() => ({
    setCurrentConversationId: actions.setCurrentConversationId,
    addConversation: actions.addConversation,
    deleteConversation: actions.deleteConversation,
    updateConversationTitle: actions.updateConversationTitle,
    addMessage: actions.addMessage,
    setLoading: actions.setLoading,
    createPrompt: actions.createPrompt,
    deletePrompt: actions.deletePrompt,
    setPromptActive: actions.setPromptActive,
  }), []);

  // Memoize selector functions
  const selectorFunctions = useMemo(() => ({
    getCurrentConversation: selectors.getCurrentConversation,
    getActivePrompt: selectors.getActivePrompt,
  }), []);
  
  return {
    conversations,
    currentConversationId,
    isLoading,
    prompts,
    ...actionHandlers,
    ...selectorFunctions,
  };
}

// Hook for Convex integration with fallback to local state
export function useConversations() {
  // Local state for UI reactivity with memoized selectors
  const conversations = useStore(store, memoizedSelectors.conversations);
  const currentConversationId = useStore(store, memoizedSelectors.currentConversationId);
  const currentConversation = useStore(store, memoizedSelectors.currentConversation);
  
  // Only use Convex if it's available
  const convexConversations = isConvexAvailable 
    ? useQuery(api.conversations.list) || []
    : null;
  
  // Convex mutations (only if Convex is available) - memoized
  const convexMutations = useMemo(() => ({
    createConversation: isConvexAvailable ? useMutation(api.conversations.create) : null,
    updateTitle: isConvexAvailable ? useMutation(api.conversations.updateTitle) : null,
    deleteConversation: isConvexAvailable ? useMutation(api.conversations.remove) : null,
    addMessageToConversation: isConvexAvailable ? useMutation(api.conversations.addMessage) : null,
  }), []);
  
  // Convert Convex conversations to local format if available
  useEffect(() => {
    if (isConvexAvailable && convexConversations && convexConversations.length > 0) {
      const formattedConversations: Conversation[] = convexConversations.map(conv => ({
        id: conv._id,
        title: conv.title,
        messages: conv.messages as Message[],
      }));
      
      actions.setConversations(formattedConversations);
    }
  }, [convexConversations]);
  
  // Memoized action handlers
  const setCurrentConversationId = useCallback((id: string | null) => {
    actions.setCurrentConversationId(id);
  }, []);
  
  const createNewConversation = useCallback(async (title: string = 'New Conversation') => {
    const id = uuidv4();
    const newConversation: Conversation = {
      id,
      title,
      messages: [],
    };
    
    // First update local state for immediate UI feedback
    actions.addConversation(newConversation);
    
    // Then create in Convex database if available
    if (isConvexAvailable && convexMutations.createConversation) {
      try {
        const convexId = await convexMutations.createConversation({
          title,
          messages: [],
        });
        
        // Update the local conversation with the Convex ID
        actions.updateConversationId(id, convexId);
        actions.setCurrentConversationId(convexId);
        
        return { id: convexId, title, messages: [] };
      } catch (error) {
        console.error('Failed to create conversation in Convex:', error);
      }
    }
    
    // If Convex is not available or there was an error, just use the local ID
    actions.setCurrentConversationId(id);
    return newConversation;
  }, [convexMutations.createConversation]);
  
  const updateConversationTitle = useCallback(async (id: string, title: string) => {
    // First update local state
    actions.updateConversationTitle(id, title);
    
    // Then update in Convex if available
    if (isConvexAvailable && convexMutations.updateTitle) {
      try {
        await convexMutations.updateTitle({ id: id as Id<'conversations'>, title });
      } catch (error) {
        console.error('Failed to update conversation title in Convex:', error);
      }
    }
  }, [convexMutations.updateTitle]);
  
  const deleteConversation = useCallback(async (id: string) => {
    // First update local state
    actions.deleteConversation(id);
    
    // Then delete from Convex if available
    if (isConvexAvailable && convexMutations.deleteConversation) {
      try {
        await convexMutations.deleteConversation({ id: id as Id<'conversations'> });
      } catch (error) {
        console.error('Failed to delete conversation from Convex:', error);
      }
    }
  }, [convexMutations.deleteConversation]);
  
  const addMessage = useCallback(async (conversationId: string, message: Message) => {
    // First update local state
    actions.addMessage(conversationId, message);
    
    // Then add to Convex if available
    if (isConvexAvailable && convexMutations.addMessageToConversation) {
      try {
        await convexMutations.addMessageToConversation({
          conversationId: conversationId as Id<'conversations'>,
          message,
        });
      } catch (error) {
        console.error('Failed to add message to Convex:', error);
      }
    }
  }, [convexMutations.addMessageToConversation]);
  
  return {
    conversations,
    currentConversationId,
    currentConversation,
    setCurrentConversationId,
    createNewConversation,
    updateConversationTitle,
    deleteConversation,
    addMessage,
  };
} 