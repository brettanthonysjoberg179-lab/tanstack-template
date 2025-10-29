import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef, useCallback, useMemo, lazy, Suspense } from 'react'
import { Settings } from 'lucide-react'
import { 
  ChatMessage, 
  LoadingIndicator, 
  ChatInput, 
  WelcomeScreen
} from '../components'
import { useConversations, useAppState, store, actions } from '../store'
import { genAIResponse, type Message } from '../utils'

// Lazy load heavy components
const SettingsDialog = lazy(() => import('../components/SettingsDialog').then(module => ({ default: module.SettingsDialog })))
const Sidebar = lazy(() => import('../components/Sidebar').then(module => ({ default: module.Sidebar })))

// Loading fallback for lazy components
const ComponentFallback = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
  </div>
)

function Home() {
  const {
    conversations,
    currentConversationId,
    currentConversation,
    setCurrentConversationId,
    createNewConversation,
    updateConversationTitle,
    deleteConversation,
    addMessage,
  } = useConversations()
  
  const { isLoading, setLoading, getActivePrompt } = useAppState()

  // Memoize messages to prevent unnecessary re-renders
  const messages = useMemo(() => currentConversation?.messages || [], [currentConversation]);

  // Check if Anthropic API key is defined
  const isAnthropicKeyDefined = Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);

  // Local state
  const [input, setInput] = useState('')
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null)
  const [error, setError] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, []);

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  const createTitleFromInput = useCallback((text: string) => {
    const words = text.trim().split(/\s+/)
    const firstThreeWords = words.slice(0, 3).join(' ')
    return firstThreeWords + (words.length > 3 ? '...' : '')
  }, []);

  // Helper function to process AI response
  const processAIResponse = useCallback(async (conversationId: string, userMessage: Message) => {
    try {
      // Get active prompt
      const activePrompt = getActivePrompt(store.state)
      let systemPrompt
      if (activePrompt) {
        systemPrompt = {
          value: activePrompt.content,
          enabled: true,
        }
      }

      // Get AI response
      const response = await genAIResponse({
        data: {
          messages: [...messages, userMessage],
          systemPrompt,
        },
      })

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader found in response')
      }

      const decoder = new TextDecoder()

      let done = false
      let newMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: '',
      }
      while (!done) {
        const out = await reader.read()
        done = out.done
        if (!done) {
          try {
            const json = JSON.parse(decoder.decode(out.value))
            if (json.type === 'content_block_delta') {
              newMessage = {
                ...newMessage,
                content: newMessage.content + json.delta.text,
              }
              setPendingMessage(newMessage)
            }
          } catch (e) {
            console.error('Error parsing streaming response:', e)
          }
        }
      }

      setPendingMessage(null)
      if (newMessage.content.trim()) {
        // Add AI message to Convex
        console.log('Adding AI response to conversation:', conversationId)
        await addMessage(conversationId, newMessage)
      }
    } catch (error) {
      console.error('Error in AI response:', error)
      // Add an error message to the conversation
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error generating a response. Please set the required API keys in your environment variables.',
      }
      await addMessage(conversationId, errorMessage)
    }
  }, [messages, getActivePrompt, addMessage]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const currentInput = input
    setInput('') // Clear input early for better UX
    setLoading(true)
    setError(null)
    
    const conversationTitle = createTitleFromInput(currentInput)

    try {
      // Create the user message object
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: currentInput.trim(),
      }
      
      let conversationId = currentConversationId

      // If no current conversation, create one in Convex first
      if (!conversationId) {
        try {
          console.log('Creating new Convex conversation with title:', conversationTitle)
          // Create a new conversation with our title
          const convexId = await createNewConversation(conversationTitle)
          
          if (convexId) {
            console.log('Successfully created Convex conversation with ID:', convexId)
            conversationId = convexId
            
            // Add user message directly to Convex
            console.log('Adding user message to Convex conversation:', userMessage.content)
            await addMessage(conversationId, userMessage)
          } else {
            console.warn('Failed to create Convex conversation, falling back to local')
            // Fallback to local storage if Convex creation failed
            const tempId = Date.now().toString()
            const tempConversation = {
              id: tempId,
              title: conversationTitle,
              messages: [],
            }
            
            actions.addConversation(tempConversation)
            conversationId = tempId
            
            // Add user message to local state
            actions.addMessage(conversationId, userMessage)
          }
        } catch (error) {
          console.error('Error creating conversation:', error)
          throw new Error('Failed to create conversation')
        }
      } else {
        // We already have a conversation ID, add message directly to Convex
        console.log('Adding user message to existing conversation:', conversationId)
        await addMessage(conversationId, userMessage)
      }
      
      // Process with AI after message is stored
      await processAIResponse(conversationId, userMessage)
      
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
      }
      await addMessage(conversationId || 'temp', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [input, isLoading, currentConversationId, createNewConversation, addMessage, processAIResponse, createTitleFromInput, setLoading]);

  const handleNewChat = useCallback(() => {
    setCurrentConversationId(null)
    setInput('')
    setError(null)
  }, [setCurrentConversationId]);

  const handleDeleteChat = useCallback(async (id: string) => {
    try {
      await deleteConversation(id)
      if (currentConversationId === id) {
        setCurrentConversationId(null)
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }, [deleteConversation, currentConversationId, setCurrentConversationId]);

  const handleUpdateChatTitle = useCallback(async (id: string, title: string) => {
    try {
      await updateConversationTitle(id, title)
    } catch (error) {
      console.error('Error updating conversation title:', error)
    }
  }, [updateConversationTitle]);

  // Memoize sidebar props to prevent unnecessary re-renders
  const sidebarProps = useMemo(() => ({
    conversations,
    currentConversationId,
    handleNewChat,
    setCurrentConversationId,
    handleDeleteChat,
    editingChatId,
    setEditingChatId,
    editingTitle,
    setEditingTitle,
    handleUpdateChatTitle,
  }), [
    conversations,
    currentConversationId,
    handleNewChat,
    setCurrentConversationId,
    handleDeleteChat,
    editingChatId,
    setEditingChatId,
    editingTitle,
    setEditingTitle,
    handleUpdateChatTitle,
  ]);

  // Show welcome screen if no conversations and no current conversation
  if (conversations.length === 0 && !currentConversationId) {
    return (
      <div className="flex h-screen bg-gray-900">
        <WelcomeScreen onStartChat={handleNewChat} />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Suspense fallback={<ComponentFallback />}>
        <Sidebar {...sidebarProps} />
      </Suspense>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-semibold text-white">TanStack Chat</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Trigger the global keyboard shortcut
                window.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 'k',
                  ctrlKey: true,
                  bubbles: true
                }))
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1.5"
              title="Quick Action Panel (Ctrl+K)"
            >
              <span>⌘K</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {pendingMessage && (
            <ChatMessage message={pendingMessage} />
          )}
          
          {isLoading && <LoadingIndicator />}
          
          {error && (
            <div className="text-red-500 text-center p-4">
              {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={isLoading || !isAnthropicKeyDefined}
            placeholder={isAnthropicKeyDefined ? "Type your message..." : "Please set VITE_ANTHROPIC_API_KEY to start chatting..."}
          />
        </div>
      </div>

      {/* Settings Dialog */}
      <Suspense fallback={<ComponentFallback />}>
        <SettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </Suspense>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: Home,
})