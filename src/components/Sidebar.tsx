import React, { useCallback } from 'react';
import { PlusCircle, MessageCircle, Trash2, Edit2 } from 'lucide-react';

interface SidebarProps {
  conversations: Array<{ id: string; title: string }>;
  currentConversationId: string | null;
  handleNewChat: () => void;
  setCurrentConversationId: (id: string) => void;
  handleDeleteChat: (id: string) => void;
  editingChatId: string | null;
  setEditingChatId: (id: string | null) => void;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  handleUpdateChatTitle: (id: string, title: string) => void;
}

// Memoized conversation item to prevent unnecessary re-renders
const ConversationItem = React.memo(({ 
  chat, 
  isActive, 
  isEditing, 
  editingTitle,
  onSelect,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onTitleChange 
}: {
  chat: { id: string; title: string };
  isActive: boolean;
  isEditing: boolean;
  editingTitle: string;
  onSelect: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onTitleChange: (value: string) => void;
}) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEdit()
    } else if (e.key === 'Escape') {
      onCancelEdit()
    }
  }, [onSaveEdit, onCancelEdit])

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-700/50 ${
        isActive ? 'bg-gray-700/50' : ''
      }`}
      onClick={onSelect}
    >
      <MessageCircle className="w-4 h-4 text-gray-400" />
      {isEditing ? (
        <input
          type="text"
          value={editingTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={onSaveEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <span className="flex-1 text-sm text-gray-200 truncate">{chat.title}</span>
          <div className="items-center hidden gap-1 group-hover:flex">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onStartEdit()
              }}
              className="p-1 text-gray-400 hover:text-white"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </>
      )}
    </div>
  )
})

ConversationItem.displayName = 'ConversationItem';

export const Sidebar = React.memo(({ 
  conversations, 
  currentConversationId, 
  handleNewChat, 
  setCurrentConversationId, 
  handleDeleteChat, 
  editingChatId, 
  setEditingChatId, 
  editingTitle, 
  setEditingTitle, 
  handleUpdateChatTitle 
}: SidebarProps) => {

  const createHandlers = useCallback((chatId: string, chatTitle: string) => ({
    onSelect: () => setCurrentConversationId(chatId),
    onStartEdit: () => {
      setEditingChatId(chatId)
      setEditingTitle(chatTitle)
    },
    onCancelEdit: () => {
      setEditingChatId(null)
      setEditingTitle('')
    },
    onSaveEdit: () => {
      if (editingTitle.trim()) {
        handleUpdateChatTitle(chatId, editingTitle.trim())
      }
      setEditingChatId(null)
      setEditingTitle('')
    },
    onDelete: () => handleDeleteChat(chatId),
    onTitleChange: setEditingTitle
  }), [
    setCurrentConversationId, 
    setEditingChatId, 
    setEditingTitle, 
    handleUpdateChatTitle, 
    handleDeleteChat, 
    editingTitle
  ])

  return (
    <div className="flex flex-col w-64 bg-gray-800 border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <PlusCircle className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((chat) => {
          const handlers = createHandlers(chat.id, chat.title)
          return (
            <ConversationItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === currentConversationId}
              isEditing={editingChatId === chat.id}
              editingTitle={editingTitle}
              {...handlers}
            />
          )
        })}
      </div>
    </div>
  )
})

Sidebar.displayName = 'Sidebar'; 