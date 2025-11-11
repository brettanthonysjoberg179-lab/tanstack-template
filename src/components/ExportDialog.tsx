import { useState } from 'react'
import { X, FileText, Download } from 'lucide-react'
import type { Ebook } from '../store/ebookStore'

interface ExportDialogProps {
  ebook: Ebook
  onClose: () => void
}

export function ExportDialog({ ebook, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<'html' | 'txt' | 'json'>('html')

  const generateHTML = (): string => {
    const sortedChapters = [...ebook.chapters].sort((a, b) => a.order - b.order)
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="${ebook.metadata.author}">
    <title>${ebook.metadata.title}</title>
    <style>
        body {
            font-family: Georgia, serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.8;
            color: #333;
        }
        .cover {
            text-align: center;
            margin-bottom: 60px;
            padding-bottom: 40px;
            border-bottom: 2px solid #eee;
        }
        .cover h1 {
            font-size: 3em;
            margin-bottom: 20px;
        }
        .cover .author {
            font-size: 1.5em;
            color: #666;
        }
        .cover .description {
            margin-top: 30px;
            color: #888;
        }
        .chapter {
            margin-bottom: 60px;
        }
        .chapter-number {
            text-transform: uppercase;
            font-size: 0.9em;
            color: #999;
            letter-spacing: 2px;
        }
        .chapter-title {
            font-size: 2.5em;
            margin: 10px 0 30px 0;
        }
        .chapter-content p {
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="cover">
        <h1>${ebook.metadata.title}</h1>
        <p class="author">${ebook.metadata.author}</p>
        ${ebook.metadata.description ? `<p class="description">${ebook.metadata.description}</p>` : ''}
    </div>
    
    ${sortedChapters.map((chapter, index) => `
    <div class="chapter">
        <p class="chapter-number">Chapter ${index + 1}</p>
        <h2 class="chapter-title">${chapter.title}</h2>
        <div class="chapter-content">
            ${chapter.content.split('\n').map(p => `<p>${p}</p>`).join('\n            ')}
        </div>
    </div>
    `).join('\n    ')}
</body>
</html>`
  }

  const generateText = (): string => {
    const sortedChapters = [...ebook.chapters].sort((a, b) => a.order - b.order)
    
    let text = `${ebook.metadata.title}\n`
    text += `by ${ebook.metadata.author}\n\n`
    if (ebook.metadata.description) {
      text += `${ebook.metadata.description}\n\n`
    }
    text += '='.repeat(50) + '\n\n'
    
    sortedChapters.forEach((chapter, index) => {
      text += `CHAPTER ${index + 1}\n`
      text += `${chapter.title}\n\n`
      text += `${chapter.content}\n\n`
      text += '-'.repeat(50) + '\n\n'
    })
    
    return text
  }

  const generateJSON = (): string => {
    return JSON.stringify(ebook, null, 2)
  }

  const handleExport = () => {
    let content: string
    let mimeType: string
    let extension: string

    switch (format) {
      case 'html':
        content = generateHTML()
        mimeType = 'text/html'
        extension = 'html'
        break
      case 'txt':
        content = generateText()
        mimeType = 'text/plain'
        extension = 'txt'
        break
      case 'json':
        content = generateJSON()
        mimeType = 'application/json'
        extension = 'json'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ebook.metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Export Ebook
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Choose a format to export your ebook:
          </p>

          <div className="space-y-3">
            <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
              <input
                type="radio"
                name="format"
                value="html"
                checked={format === 'html'}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-orange-500 mr-2" />
                  <span className="font-medium text-gray-900">HTML</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Web-ready HTML file with styling
                </p>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
              <input
                type="radio"
                name="format"
                value="txt"
                checked={format === 'txt'}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">Plain Text</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Simple text file (.txt)
                </p>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
              <input
                type="radio"
                name="format"
                value="json"
                checked={format === 'json'}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="font-medium text-gray-900">JSON</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Data format for importing later
                </p>
              </div>
            </label>
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
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  )
}
