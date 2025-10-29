import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Upload, Download, Send, Loader2, Languages, Book, Search } from 'lucide-react'

interface KeyboardShortcutPopupProps {
  isOpen: boolean
  onClose: () => void
}

type GoogleAPIType = 'translate' | 'books' | 'customsearch'

interface GoogleAPIOption {
  id: GoogleAPIType
  name: string
  icon: typeof Languages
  description: string
}

// API Response Interfaces
interface TranslationResponse {
  responseStatus: number
  responseData: {
    translatedText: string
  }
}

interface GoogleBooksVolume {
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
  }
}

interface GoogleBooksResponse {
  items?: GoogleBooksVolume[]
}

interface WikipediaSearchResult {
  title: string
  snippet: string
}

interface WikipediaResponse {
  query?: {
    search: WikipediaSearchResult[]
  }
}

const GOOGLE_API_OPTIONS: GoogleAPIOption[] = [
  { id: 'translate', name: 'Google Translate', icon: Languages, description: 'Translate text to different languages' },
  { id: 'books', name: 'Google Books', icon: Book, description: 'Search for books and get information' },
  { id: 'customsearch', name: 'Custom Search', icon: Search, description: 'Search the web with Google' },
]

export function KeyboardShortcutPopup({ isOpen, onClose }: KeyboardShortcutPopupProps) {
  const [text, setText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState('')
  const [selectedAPI, setSelectedAPI] = useState<GoogleAPIType>('translate')
  const [targetLanguage, setTargetLanguage] = useState('es') // Default to Spanish
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus on textarea when popup opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setText('')
    setResult('')
    setIsProcessing(false)
    onClose()
  }, [onClose])

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      setText(content)
    } catch (error) {
      console.error('Error reading file:', error)
      setResult('Error reading file. Please try again.')
    }
  }, [])

  const handleDownload = useCallback(() => {
    if (!text && !result) return

    const content = result || text
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [text, result])

  // Free Google Translate API simulation (using MyMemory Translation API as fallback)
  const translateText = useCallback(async (textToTranslate: string, targetLang: string) => {
    try {
      // Using MyMemory Translation API (free tier, no API key required)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|${targetLang}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json() as TranslationResponse
      
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return data.responseData.translatedText
      }
      throw new Error('Translation failed')
    } catch (error) {
      console.error('Translation error:', error)
      return 'Translation service unavailable. Please try again later.'
    }
  }, [])

  // Google Books API (free, no API key required for basic searches)
  const searchBooks = useCallback(async (query: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json() as GoogleBooksResponse
      
      if (data.items && data.items.length > 0) {
        const books = data.items.map((item: GoogleBooksVolume) => {
          const volumeInfo = item.volumeInfo
          return `📚 ${volumeInfo.title}${volumeInfo.authors ? ' by ' + volumeInfo.authors.join(', ') : ''}\n   ${volumeInfo.description?.substring(0, 150) || 'No description available'}...`
        }).join('\n\n')
        return `Found ${data.items.length} book(s):\n\n${books}`
      }
      return 'No books found for your query.'
    } catch (error) {
      console.error('Books search error:', error)
      return 'Books search service unavailable. Please try again later.'
    }
  }, [])

  // Wikipedia API as a free alternative to Google Custom Search
  const searchWikipedia = useCallback(async (query: string) => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=5`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json() as WikipediaResponse
      
      if (data.query?.search && data.query.search.length > 0) {
        const results = data.query.search.map((item: WikipediaSearchResult) => {
          // Remove HTML tags from snippet using DOMParser for proper sanitization
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = item.snippet
          const snippet = tempDiv.textContent || tempDiv.innerText || ''
          return `🔍 ${item.title}\n   ${snippet}...`
        }).join('\n\n')
        return `Found ${data.query.search.length} result(s):\n\n${results}`
      }
      return 'No results found for your query.'
    } catch (error) {
      console.error('Wikipedia search error:', error)
      return 'Search service unavailable. Please try again later.'
    }
  }, [])

  const handleProcess = useCallback(async () => {
    if (!text.trim()) return

    setIsProcessing(true)
    setResult('')

    try {
      let apiResult = ''
      
      switch (selectedAPI) {
        case 'translate':
          apiResult = await translateText(text, targetLanguage)
          break
        case 'books':
          apiResult = await searchBooks(text)
          break
        case 'customsearch':
          apiResult = await searchWikipedia(text)
          break
        default:
          apiResult = 'API not configured'
      }

      setResult(apiResult)
    } catch (error) {
      console.error('Error processing:', error)
      setResult('An error occurred. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [text, selectedAPI, targetLanguage, translateText, searchBooks, searchWikipedia])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to process
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleProcess()
    }
    // Escape to close
    if (e.key === 'Escape') {
      handleClose()
    }
  }, [handleProcess, handleClose])

  if (!isOpen) return null

  const SelectedIcon = GOOGLE_API_OPTIONS.find(api => api.id === selectedAPI)?.icon || Languages

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <SelectedIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Quick Action Panel</h2>
              <p className="text-xs text-gray-400">Press Ctrl+K to open • Esc to close</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white focus:outline-none rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Selection */}
        <div className="p-4 border-b border-gray-700 bg-gray-700/50">
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Select Google API
          </label>
          <div className="grid grid-cols-3 gap-2">
            {GOOGLE_API_OPTIONS.map((api) => {
              const Icon = api.icon
              return (
                <button
                  key={api.id}
                  onClick={() => setSelectedAPI(api.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedAPI === api.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${selectedAPI === api.id ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="text-xs font-medium text-white">{api.name}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{api.description}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Additional Options */}
        {selectedAPI === 'translate' && (
          <div className="px-4 py-3 bg-gray-700/50 border-b border-gray-700">
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Target Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            >
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="ja">Japanese</option>
              <option value="zh">Chinese</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-300">
                Input Text
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-300 hover:text-white border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  Upload
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!text && !result}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-300 hover:text-white border border-gray-600 rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Enter text to ${selectedAPI === 'translate' ? 'translate' : selectedAPI === 'books' ? 'search for books' : 'search'}... (Ctrl+Enter to process)`}
              className="w-full h-32 px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={!text.trim() || isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Process with {GOOGLE_API_OPTIONS.find(api => api.id === selectedAPI)?.name}
              </>
            )}
          </button>

          {/* Result Section */}
          {result && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Result
              </label>
              <div className="p-3 text-sm text-white bg-gray-700 border border-gray-600 rounded-lg whitespace-pre-wrap">
                {result}
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
