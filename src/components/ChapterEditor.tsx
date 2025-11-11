import { useState, useEffect } from 'react'
import type { Chapter } from '../store/ebookStore'
import { ebookActions } from '../store/ebookStore'

interface ChapterEditorProps {
  chapter: Chapter
}

export function ChapterEditor({ chapter }: ChapterEditorProps) {
  const [title, setTitle] = useState(chapter.title)
  const [content, setContent] = useState(chapter.content)

  // Update local state when chapter changes
  useEffect(() => {
    setTitle(chapter.title)
    setContent(chapter.content)
  }, [chapter.id, chapter.title, chapter.content])

  const handleTitleBlur = () => {
    if (title !== chapter.title) {
      ebookActions.updateChapter(chapter.id, { title })
    }
  }

  const handleContentBlur = () => {
    if (content !== chapter.content) {
      ebookActions.updateChapter(chapter.id, { content })
    }
  }

  return (
    <div className="h-full flex flex-col p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Chapter Title"
          className="w-full text-3xl font-bold text-gray-900 placeholder-gray-400 border-none focus:outline-none focus:ring-0 bg-transparent"
        />
      </div>
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleContentBlur}
          placeholder="Start writing your chapter content here..."
          className="w-full h-full text-lg text-gray-700 placeholder-gray-400 border-none focus:outline-none focus:ring-0 resize-none bg-transparent leading-relaxed"
        />
      </div>
      <div className="mt-4 text-sm text-gray-500">
        {content.length} characters · {content.split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  )
}
