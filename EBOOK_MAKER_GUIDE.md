# Ebook Maker - User Guide

## Overview

The Ebook Maker is a complete frontend application for creating, editing, and exporting ebooks. Built with React, TanStack Router, and TanStack Store, it provides a professional writing environment with chapter management, live preview, and multiple export formats.

## Features

### 📚 Chapter Management
- **Add Chapters**: Create new chapters with custom titles
- **Edit Chapters**: Write and edit chapter content in a distraction-free editor
- **Delete Chapters**: Remove chapters you no longer need
- **Navigate Chapters**: Easily switch between chapters using the sidebar
- **Chapter Ordering**: Chapters maintain their order automatically

### ✍️ Rich Editor
- **Clean Interface**: Distraction-free writing environment
- **Live Stats**: Real-time character and word count
- **Auto-Save**: Changes are saved automatically when you blur the input fields
- **Large Text Area**: Comfortable full-screen editor for chapter content

### 📝 Metadata Management
- **Book Title**: Set your ebook's title
- **Author Name**: Specify the author
- **Description**: Add a description or synopsis
- **Easy Editing**: Update metadata anytime via the "Edit Info" button

### 👁️ Live Preview
- **Professional Layout**: See your ebook in a book-like format
- **Cover Page**: Displays title, author, and description
- **Chapter Format**: Each chapter shown with proper formatting
- **Full Content**: Preview all chapters in order

### 💾 Export Options

#### HTML Export
- Fully styled, web-ready HTML file
- Beautiful typography with embedded CSS
- Professional book layout
- Ready to host on any website

#### Plain Text Export
- Simple .txt format
- Clean, readable text
- Perfect for printing or basic distribution

#### JSON Export
- Structured data format
- Contains all ebook information
- Can be used for backup or re-importing

### 💼 Project Management
- **Save Ebooks**: Save your work to local storage
- **Load Ebooks**: Return to previously saved ebooks
- **Multiple Projects**: Work on multiple ebooks simultaneously
- **Delete Projects**: Remove ebooks you no longer need

## How to Use

### Getting Started

1. **Access the Ebook Maker**
   - Navigate to `/ebook-maker` in your browser
   - Or click the "Ebook Maker" button in the sidebar

2. **Create a New Ebook**
   - Click "Create New Ebook"
   - Enter the title and author (required)
   - Add a description (optional)
   - Click "Create Ebook"

### Writing Your Ebook

1. **Add Chapters**
   - Click the "Add Chapter" button in the toolbar
   - Enter a chapter title
   - The chapter appears in the sidebar

2. **Write Content**
   - Click on a chapter in the sidebar to open it
   - Edit the chapter title at the top
   - Write your content in the large text area
   - Watch the character and word count update

3. **Navigate Between Chapters**
   - Click on any chapter in the sidebar
   - The editor automatically saves your work when you switch chapters

### Managing Your Ebook

1. **Edit Metadata**
   - Click "Edit Info" in the toolbar
   - Update title, author, or description
   - Click "Save Changes"

2. **Preview Your Work**
   - Click the "Preview" button
   - Scroll through the formatted ebook
   - Close the preview to continue editing

3. **Save Your Progress**
   - Click the "Save" button in the toolbar
   - Your ebook is saved to local storage
   - Return anytime to continue working

### Exporting Your Ebook

1. **Open Export Dialog**
   - Click the "Export" button in the toolbar

2. **Choose Format**
   - Select HTML for a styled web version
   - Select Plain Text for a simple text file
   - Select JSON for backup or data export

3. **Download**
   - Click the "Export" button
   - The file downloads automatically

### Loading Saved Ebooks

1. **Return to Landing Page**
   - Navigate to `/ebook-maker`
   - Or close your current ebook (save first!)

2. **View Saved Ebooks**
   - Scroll down to see "Your Ebooks"
   - Click on any saved ebook to load it

3. **Delete Ebooks**
   - Hover over an ebook in the list
   - Click the trash icon to delete it

## Technical Architecture

### State Management
- **TanStack Store**: Reactive state management for ebook data
- **Automatic Updates**: UI updates immediately when data changes
- **Immutable Updates**: Safe state mutations

### Components Structure
```
EbookStarter (Landing Page)
  ├─ NewEbookDialog (Create new ebook)
  └─ Saved Ebooks List

EbookEditor (Main Editor)
  ├─ Toolbar
  │   ├─ Edit Info Button
  │   ├─ Add Chapter Button
  │   ├─ Preview Button
  │   ├─ Export Button
  │   └─ Save Button
  ├─ ChapterList (Sidebar)
  │   └─ Chapter Items
  └─ ChapterEditor (Main Content)
      ├─ Title Input
      └─ Content Textarea

Dialogs
  ├─ MetadataEditor
  ├─ EbookPreview
  └─ ExportDialog
```

### Data Model
```typescript
interface Ebook {
  id: string
  metadata: {
    title: string
    author: string
    description: string
  }
  chapters: Chapter[]
  createdAt: number
  updatedAt: number
}

interface Chapter {
  id: string
  title: string
  content: string
  order: number
}
```

## Tips and Best Practices

### Writing Tips
1. **Break into Chapters**: Organize your content into logical chapters
2. **Use Descriptive Titles**: Make chapter titles clear and engaging
3. **Save Often**: Click the Save button regularly
4. **Preview Regularly**: Check how your ebook looks as you write

### Organization Tips
1. **One Project at a Time**: Focus on one ebook before starting another
2. **Backup Your Work**: Export to JSON periodically for backup
3. **Plan Your Structure**: Think about chapter organization before writing

### Export Tips
1. **HTML for Web**: Use HTML export for online publication
2. **Text for Editing**: Use Plain Text to edit in other programs
3. **JSON for Backup**: Keep JSON backups of your work

## Keyboard Shortcuts

- **Tab**: In chapter editor, moves focus (use for navigation)
- **Shift+Enter**: In dialogs, adds new line in text inputs
- **Escape**: Closes open dialogs

## Browser Compatibility

The Ebook Maker works best in modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Storage

- Ebooks are stored in the browser's local storage
- Data persists between sessions
- Clearing browser data will delete saved ebooks
- Use JSON export for permanent backups

## Limitations

- No cloud sync (local storage only)
- No collaborative editing
- No version history
- No spell check (use browser's built-in)
- File size limited by browser storage limits

## Future Enhancements

Potential features for future versions:
- Cloud storage integration
- Markdown support
- Image insertion
- Table of contents generation
- EPUB export format
- PDF export
- Spell check integration
- Multiple themes
- Font customization
- Print layout preview

## Support

For issues or questions:
1. Check this guide first
2. Review the component code in `src/components/`
3. Check the state management in `src/store/ebookStore.ts`
4. Review the route definition in `src/routes/ebook-maker.tsx`

## Credits

Built with:
- React 19
- TanStack Router
- TanStack Store
- Tailwind CSS
- Lucide React Icons
- TypeScript
