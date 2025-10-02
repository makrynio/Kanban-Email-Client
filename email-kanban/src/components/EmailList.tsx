import React from 'react';
import type { DemoEmail } from '../services/DemoEmailService';

interface EmailListProps {
  messages: DemoEmail[];
  selectedEmail: DemoEmail | null;
  onSelectEmail: (email: DemoEmail) => void;
}

export function EmailList({ messages, selectedEmail, onSelectEmail }: EmailListProps) {
  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { 
      month: 'short',
      day: 'numeric',
      year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="flex-1 overflow-auto bg-white">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages in this folder
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {messages.map((message) => (
            <button
              key={message.id}
              onClick={() => onSelectEmail(message)}
              className={`w-full text-left px-4 py-3 transition-colors ${
                selectedEmail?.id === message.id
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              } ${!message.isRead ? 'font-semibold' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm truncate flex-1">
                  {message.from}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {formatDate(message.date)}
                </span>
              </div>
              <div className="text-sm font-medium truncate mb-1">
                {message.subject}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {message.snippet}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
