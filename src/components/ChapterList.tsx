import { Trash2, GripVertical } from 'lucide-react'
import type { Chapter } from '../store/ebookStore'
import { ebookActions } from '../store/ebookStore'

interface ChapterListProps {
  chapters: Chapter[]
  selectedChapterId: string | null
  onSelectChapter: (chapterId: string) => void
}

export function ChapterList({
  chapters,
  selectedChapterId,
  onSelectChapter,
}: ChapterListProps) {
  const handleDeleteChapter = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this chapter?')) {
      ebookActions.deleteChapter(chapterId)
    }
  }

  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order)

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chapters</h2>
        {sortedChapters.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No chapters yet. Click "Add Chapter" to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {sortedChapters.map((chapter, index) => (
              <div
                key={chapter.id}
                onClick={() => onSelectChapter(chapter.id)}
                className={`
                  group relative p-3 rounded-lg cursor-pointer transition-colors
                  ${
                    selectedChapterId === chapter.id
                      ? 'bg-orange-100 border-2 border-orange-500'
                      : 'bg-white border-2 border-transparent hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-1">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        Chapter {index + 1}
                      </span>
                      <button
                        onClick={(e) => handleDeleteChapter(chapter.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 focus:outline-none transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mt-1 truncate">
                      {chapter.title || 'Untitled Chapter'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {chapter.content
                        ? chapter.content.substring(0, 60) + '...'
                        : 'No content yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
