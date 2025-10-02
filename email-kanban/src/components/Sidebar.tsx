import React from 'react'
import { Folder, Mail, Inbox, Archive, Star, Send, Trash2, Settings } from 'lucide-react'
import { Folder as FolderType } from '../types'

interface SidebarProps {
  selectedFolder: string
  onFolderSelect: (folderId: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ selectedFolder, onFolderSelect }) => {
  const folders: FolderType[] = [
    { id: 'inbox', name: 'Inbox', icon: 'inbox', count: 12 },
    { id: 'sent', name: 'Sent', icon: 'send', count: 8 },
    { id: 'drafts', name: 'Drafts', icon: 'file', count: 3 },
    { id: 'archive', name: 'Archive', icon: 'archive', count: 45 },
    { id: 'trash', name: 'Trash', icon: 'trash', count: 0 },
    { id: 'flagged', name: 'Flagged', icon: 'star', count: 7 },
  ]

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'inbox': return <Inbox className="w-5 h-5" />
      case 'send': return <Send className="w-5 h-5" />
      case 'file': return <Folder className="w-5 h-5" />
      case 'archive': return <Archive className="w-5 h-5" />
      case 'trash': return <Trash2 className="w-5 h-5" />
      case 'star': return <Star className="w-5 h-5" />
      default: return <Mail className="w-5 h-5" />
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Email Kanban</h1>
            <p className="text-sm text-gray-500">user@example.com</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onFolderSelect(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {getIcon(folder.icon)}
                <span className="font-medium">{folder.name}</span>
              </div>
              {folder.count > 0 && (
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {folder.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
