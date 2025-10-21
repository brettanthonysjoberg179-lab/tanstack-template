import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { Book, Plus, FolderOpen, Trash2 } from 'lucide-react'
import { ebookStore, ebookActions, ebookSelectors, type Ebook } from '../store/ebookStore'

export function EbookStarter() {
  const savedEbooks = useStore(ebookStore, (state) =>
    ebookSelectors.getSavedEbooks(state)
  )
  const [showNewEbookDialog, setShowNewEbookDialog] = useState(false)

  const handleLoadEbook = (ebook: Ebook) => {
    ebookActions.loadEbook(ebook)
  }

  const handleDeleteEbook = (ebookId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this ebook?')) {
      ebookActions.deleteEbook(ebookId)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="w-full max-w-4xl px-4">
        <div className="text-center mb-12">
          <Book className="w-20 h-20 text-orange-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ebook Maker
          </h1>
          <p className="text-lg text-gray-600">
            Create and manage your ebooks with ease
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setShowNewEbookDialog(true)}
            className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-orange-500 group"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                <Plus className="w-8 h-8 text-orange-500 group-hover:text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Create New Ebook
              </h2>
              <p className="text-gray-600 text-sm">
                Start writing a new ebook from scratch
              </p>
            </div>
          </button>

          <div className="p-8 bg-white rounded-xl shadow-lg border-2 border-gray-200">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Saved Ebooks
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {savedEbooks.length} ebook{savedEbooks.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
        </div>

        {savedEbooks.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Ebooks
            </h3>
            <div className="space-y-3">
              {savedEbooks.map((ebook) => (
                <div
                  key={ebook.id}
                  onClick={() => handleLoadEbook(ebook)}
                  className="group flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Book className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium text-gray-900 truncate">
                        {ebook.metadata.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        by {ebook.metadata.author} · {ebook.chapters.length} chapter{ebook.chapters.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteEbook(ebook.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 focus:outline-none transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showNewEbookDialog && (
        <NewEbookDialog onClose={() => setShowNewEbookDialog(false)} />
      )}
    </div>
  )
}

interface NewEbookDialogProps {
  onClose: () => void
}

function NewEbookDialog({ onClose }: NewEbookDialogProps) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = () => {
    if (!title.trim() || !author.trim()) {
      alert('Please enter a title and author')
      return
    }
    ebookActions.createNewEbook({ title, author, description })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Ebook
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter ebook title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Author *
            </label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter ebook description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Create Ebook
          </button>
        </div>
      </div>
    </div>
  )
}
