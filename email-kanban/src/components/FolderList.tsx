import React from 'react';
import { Inbox, Mail, Folder, Trash, AlertTriangle, FileText } from 'lucide-react';
import { DemoLabel, GmailLabel } from '../types';

interface FolderListProps {
  folders: (DemoLabel | GmailLabel)[];
  selectedFolder: string | null;
  onFolderSelect: (folderId: string) => void;
  loading?: boolean;
}

export function FolderList({ folders, selectedFolder, onFolderSelect, loading }: FolderListProps) {
  const getFolderIcon = (id: string, name: string) => {
    if (id.toLowerCase() === 'inbox') return <Inbox className="w-5 h-5" />;
    if (id.toLowerCase() === 'sent') return <Mail className="w-5 h-5" />;
    if (id.toLowerCase() === 'drafts') return <FileText className="w-5 h-5" />;
    if (id.toLowerCase() === 'trash') return <Trash className="w-5 h-5" />;
    if (id.toLowerCase() === 'spam') return <AlertTriangle className="w-5 h-5" />;
    return <Folder className="w-5 h-5" />;
  };

  const getFolderDisplayName = (id: string, name: string) => {
    const displayNames: { [key: string]: string } = {
      'inbox': 'Inbox',
      'sent': 'Sent',
      'drafts': 'Drafts',
      'trash': 'Trash',
      'spam': 'Spam'
    };
    return displayNames[id.toLowerCase()] || name;
  };

  const getUnreadCount = (folder: DemoLabel | GmailLabel) => {
    if ('unreadCount' in folder) {
      return folder.unreadCount;
    } else if ('messagesUnread' in folder) {
      return folder.messagesUnread;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Folders</h2>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Folders</h2>
      <div className="space-y-1">
        {folders.map((folder) => {
          const unreadCount = getUnreadCount(folder);
          return (
            <button
              key={folder.id}
              onClick={() => onFolderSelect(folder.id)}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{getFolderIcon(folder.id, folder.name)}</span>
              <span className="truncate">{getFolderDisplayName(folder.id, folder.name)}</span>
              {unreadCount > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
