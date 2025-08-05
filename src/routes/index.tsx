import { createFileRoute } from '@tanstack/react-router'
import React, { useEffect, useState, useRef, useCallback, useMemo, lazy, Suspense } from 'react'
import { Settings } from 'lucide-react'
import { 
  ChatMessage, 
  LoadingIndicator, 
  ChatInput, 
  Sidebar, 
  WelcomeScreen 
} from '../components'
import { useConversations, useAppState, store, actions } from '../store'
import { genAIResponse, type Message } from '../utils'

// Lazy load heavy components that are not always visible
const SettingsDialog = lazy(() => 
  import('../components').then(module => ({ default: module.SettingsDialog }))
)

// Memoized message list to prevent unnecessary re-renders
const MessageList = React.memo(({ 
  messages, 
  pendingMessage, 
  isLoading 
}: { 
  messages: Message[], 
  pendingMessage: Message | null, 
  isLoading: boolean 
}) => {
  const allMessages = useMemo(() => 
    [...messages, pendingMessage].filter((message): message is Message => message !== null),
    [messages, pendingMessage]
  )

  return (
    <div className="w-full max-w-3xl px-4 mx-auto">
      {allMessages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isLoading && <LoadingIndicator />}
    </div>
  )
})

MessageList.displayName = 'MessageList'

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
  const isAnthropicKeyDefined = useMemo(() => 
    Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY), 
    []
  );

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
          } catch (parseError) {
            console.error('Error parsing chunk:', parseError)
            continue
          }
        }
      }

      await addMessage(conversationId, newMessage)
    } catch (error) {
      console.error('Error processing AI response:', error)
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error processing your request.',
      }
      await addMessage(conversationId, errorMessage)
    }
  }, [messages, getActivePrompt, addMessage]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setError(null)
    setLoading(true)

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input.trim(),
      }

      // Add pending message for immediate UI feedback
      setPendingMessage(userMessage)

      let conversationId = currentConversationId

      // Create new conversation if none exists
      if (!conversationId) {
        const title = createTitleFromInput(input)
        const newConversation = await createNewConversation(title)
        conversationId = newConversation.id
      }

      // Add user message
      await addMessage(conversationId, userMessage)
      setPendingMessage(null)
      setInput('')

      // Process AI response
      await processAIResponse(conversationId, userMessage)
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setPendingMessage(null)
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error processing your request.',
      }
      if (currentConversationId) {
        await addMessage(currentConversationId, errorMessage)
      }
      else {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError('An unknown error occurred.')
        }
      }
    } finally {
      setLoading(false)
    }
  }, [input, isLoading, createTitleFromInput, currentConversationId, createNewConversation, addMessage, processAIResponse, setLoading]);

  const handleNewChat = useCallback(() => {
    createNewConversation()
  }, [createNewConversation]);

  const handleDeleteChat = useCallback(async (id: string) => {
    await deleteConversation(id)
  }, [deleteConversation]);

  const handleUpdateChatTitle = useCallback(async (id: string, title: string) => {
    await updateConversationTitle(id, title)
    setEditingChatId(null)
    setEditingTitle('')
  }, [updateConversationTitle]);

  const handleSettingsOpen = useCallback(() => setIsSettingsOpen(true), [])
  const handleSettingsClose = useCallback(() => setIsSettingsOpen(false), [])

  return (
    <div className="relative flex h-screen bg-gray-900">
      {/* Settings Button */}
      <div className="absolute z-50 top-5 right-5">
        <button
          onClick={handleSettingsOpen}
          className="flex items-center justify-center w-10 h-10 text-white transition-opacity rounded-full bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar 
        conversations={conversations}
        currentConversationId={currentConversationId}
        handleNewChat={handleNewChat}
        setCurrentConversationId={setCurrentConversationId}
        handleDeleteChat={handleDeleteChat}
        editingChatId={editingChatId}
        setEditingChatId={setEditingChatId}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
        handleUpdateChatTitle={handleUpdateChatTitle}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {!isAnthropicKeyDefined && (
          <div className="w-full max-w-3xl px-2 py-2 mx-auto mt-4 mb-2 font-medium text-center text-white bg-orange-500 rounded-md text-sm">
            <p>This app requires an Anthropic API key to work properly. Update your <code>.env</code> file or get a <a href='https://console.anthropic.com/settings/keys' className='underline'>new Anthropic key</a>.</p>
            <p>For local development, use <a href='https://www.netlify.com/products/dev/' className='underline'>netlify dev</a> to automatically load environment variables.</p>
          </div>
        )}
        {error && (
          <p className="w-full max-w-3xl p-4 mx-auto font-bold text-orange-500">{error}</p>
        )}
        {currentConversationId ? (
          <>
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 pb-24 overflow-y-auto"
            >
              <MessageList 
                messages={messages}
                pendingMessage={pendingMessage}
                isLoading={isLoading}
              />
            </div>

            {/* Input */}
            <ChatInput 
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </>
        ) : (
          <WelcomeScreen 
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Settings Dialog - Lazy loaded */}
      <Suspense fallback={null}>
        <SettingsDialog
          isOpen={isSettingsOpen}
          onClose={handleSettingsClose}
        />
      </Suspense>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: Home,
})