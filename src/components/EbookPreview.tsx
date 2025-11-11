import { X } from 'lucide-react'
import type { Ebook } from '../store/ebookStore'

interface EbookPreviewProps {
  ebook: Ebook
  onClose: () => void
}

export function EbookPreview({ ebook, onClose }: EbookPreviewProps) {
  const sortedChapters = [...ebook.chapters].sort((a, b) => a.order - b.order)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Cover Page */}
          <div className="text-center mb-12 pb-12 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {ebook.metadata.title}
            </h1>
            <p className="text-xl text-gray-600 mb-2">{ebook.metadata.author}</p>
            {ebook.metadata.description && (
              <p className="text-gray-500 mt-6 max-w-2xl mx-auto">
                {ebook.metadata.description}
              </p>
            )}
          </div>

          {/* Chapters */}
          {sortedChapters.map((chapter, index) => (
            <div key={chapter.id} className="mb-12">
              <div className="mb-4">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                  Chapter {index + 1}
                </p>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {chapter.title}
                </h2>
              </div>
              <div className="prose prose-lg max-w-none">
                {chapter.content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {sortedChapters.length === 0 && (
            <p className="text-center text-gray-500 py-12">
              No chapters to preview. Add chapters to see them here.
            </p>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}
