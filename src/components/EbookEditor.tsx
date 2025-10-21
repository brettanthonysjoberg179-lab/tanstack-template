import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { Save, Plus, Eye, Download, Book } from 'lucide-react'
import { ebookStore, ebookActions, ebookSelectors } from '../store/ebookStore'
import { ChapterList } from './ChapterList'
import { ChapterEditor } from './ChapterEditor'
import { EbookPreview } from './EbookPreview'
import { ExportDialog } from './ExportDialog'
import { MetadataEditor } from './MetadataEditor'

export function EbookEditor() {
  const currentEbook = useStore(ebookStore, (state) =>
    ebookSelectors.getCurrentEbook(state)
  )
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)

  const handleSave = () => {
    ebookActions.saveEbook()
    alert('Ebook saved successfully!')
  }

  const handleAddChapter = () => {
    const title = prompt('Enter chapter title:')
    if (title) {
      ebookActions.addChapter(title)
    }
  }

  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId)
  }

  const selectedChapter = currentEbook?.chapters.find(
    ch => ch.id === selectedChapterId
  )

  if (!currentEbook) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Ebook Loaded
          </h2>
          <p className="text-gray-500">
            Create a new ebook or load an existing one to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <Book className="w-6 h-6 text-orange-500" />
            <h1 className="text-xl font-semibold text-gray-900">
              {currentEbook.metadata.title || 'Untitled Ebook'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMetadata(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Edit Info
            </button>
            <button
              onClick={handleAddChapter}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Chapter</span>
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chapter List Sidebar */}
          <ChapterList
            chapters={currentEbook.chapters}
            selectedChapterId={selectedChapterId}
            onSelectChapter={handleSelectChapter}
          />

          {/* Chapter Editor */}
          <div className="flex-1 overflow-y-auto">
            {selectedChapter ? (
              <ChapterEditor chapter={selectedChapter} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500">
                    Select a chapter to edit or add a new one
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showMetadata && (
        <MetadataEditor
          metadata={currentEbook.metadata}
          onClose={() => setShowMetadata(false)}
        />
      )}
      {showPreview && (
        <EbookPreview
          ebook={currentEbook}
          onClose={() => setShowPreview(false)}
        />
      )}
      {showExport && (
        <ExportDialog
          ebook={currentEbook}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  )
}
