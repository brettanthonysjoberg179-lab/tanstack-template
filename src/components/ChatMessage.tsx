import { lazy, Suspense, useState, useCallback } from 'react'
import type { Message } from '../utils/ai'
import { Pencil, Check, X } from 'lucide-react'

// Lazy load ReactMarkdown and its plugins to reduce initial bundle size
const ReactMarkdown = lazy(() => import('react-markdown'))
const rehypeRaw = lazy(() => import('rehype-raw'))
const rehypeSanitize = lazy(() => import('rehype-sanitize'))
const rehypeHighlight = lazy(() => import('rehype-highlight'))

// Loading fallback for markdown content
const MarkdownFallback = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-700 rounded mb-2"></div>
    <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
  </div>
)

interface ChatMessageProps {
  message: Message
  onEdit?: (messageId: string, newContent: string) => void
  isEditable?: boolean
}

export const ChatMessage = ({ message, onEdit, isEditable = false }: ChatMessageProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)

  const handleStartEdit = useCallback(() => {
    setEditedContent(message.content)
    setIsEditing(true)
  }, [message.content])

  const handleSaveEdit = useCallback(() => {
    if (editedContent.trim() && editedContent !== message.content) {
      onEdit?.(message.id, editedContent.trim())
    }
    setIsEditing(false)
  }, [editedContent, message.id, message.content, onEdit])

  const handleCancelEdit = useCallback(() => {
    setEditedContent(message.content)
    setIsEditing(false)
  }, [message.content])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleCancelEdit()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSaveEdit()
    }
  }, [handleCancelEdit, handleSaveEdit])

  return (
    <div
      className={`py-6 ${
        message.role === 'assistant'
          ? 'bg-gradient-to-r from-orange-500/5 to-red-600/5'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-start w-full max-w-3xl gap-4 mx-auto">
        {message.role === 'assistant' ? (
          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 ml-4 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
            AI
          </div>
        ) : (
          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-medium text-white bg-gray-700 rounded-lg">
            Y
          </div>
        )}
        <div className="flex-1 min-w-0 mr-4">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 text-sm text-white border rounded-lg resize-none border-orange-500/20 bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                rows={Math.min(Math.max(editedContent.split('\n').length, 3), 10)}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-white transition-colors bg-orange-500 rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-gray-300 transition-colors bg-gray-700 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <span className="text-xs text-gray-500 self-center ml-2">
                  Ctrl/Cmd + Enter to save, Esc to cancel
                </span>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <Suspense fallback={<MarkdownFallback />}>
                <ReactMarkdown
                  className="prose dark:prose-invert max-w-none"
                  rehypePlugins={[
                    rehypeRaw,
                    rehypeSanitize,
                    rehypeHighlight,
                  ]}
                >
                  {message.content}
                </ReactMarkdown>
              </Suspense>
              {isEditable && message.role === 'user' && (
                <button
                  onClick={handleStartEdit}
                  className="absolute top-0 right-0 p-1 text-gray-400 transition-opacity opacity-0 hover:text-orange-500 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                  title="Edit message"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 