import { lazy, Suspense, memo } from 'react'
import type { Message } from '../utils/ai'

// Lazy load markdown components to reduce initial bundle size
const ReactMarkdown = lazy(() => import('react-markdown'))
const rehypeRaw = lazy(() => import('rehype-raw'))
const rehypeSanitize = lazy(() => import('rehype-sanitize'))
const rehypeHighlight = lazy(() => import('rehype-highlight'))

// Simple fallback component
const MarkdownFallback = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-700 rounded mb-2"></div>
    <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
  </div>
)

export const ChatMessage = memo(({ message }: { message: Message }) => (
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
      </div>
    </div>
  </div>
)) 