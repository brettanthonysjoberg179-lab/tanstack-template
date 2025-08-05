import React, { lazy, Suspense } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import type { Message } from '../utils/ai'

// Lazy load highlight.js only when needed (when code blocks are present)
const rehypeHighlight = lazy(() => import('rehype-highlight'))

// Memoized message component to prevent unnecessary re-renders
export const ChatMessage = React.memo(({ message }: { message: Message }) => {
  // Check if message contains code blocks to conditionally load highlight.js
  const hasCodeBlocks = message.content.includes('```') || message.content.includes('`')
  
  const rehypePlugins = [
    rehypeRaw,
    rehypeSanitize,
    // Only include highlight plugin if there are code blocks
    ...(hasCodeBlocks ? [rehypeHighlight] : [])
  ]

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
          {hasCodeBlocks ? (
            <Suspense fallback={
              <div className="prose dark:prose-invert max-w-none">
                {message.content}
              </div>
            }>
              <ReactMarkdown
                className="prose dark:prose-invert max-w-none"
                rehypePlugins={rehypePlugins}
              >
                {message.content}
              </ReactMarkdown>
            </Suspense>
          ) : (
            <ReactMarkdown
              className="prose dark:prose-invert max-w-none"
              rehypePlugins={rehypePlugins}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  )
})

ChatMessage.displayName = 'ChatMessage'; 