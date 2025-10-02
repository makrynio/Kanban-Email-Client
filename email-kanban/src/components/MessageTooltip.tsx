import React from 'react';
import { DemoEmail } from '../types';

interface MessageTooltipProps {
  email: DemoEmail;
  position: { x: number; y: number };
  isVisible: boolean;
  tooltipRef: React.RefObject<HTMLDivElement>;
  columnColor?: string;
}

const MessageTooltip: React.FC<MessageTooltipProps> = ({
  email,
  position,
  isVisible,
  tooltipRef,
  columnColor = 'bg-blue-500',
}) => {
  if (!isVisible) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg w-96 max-w-lg p-4 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        animation: 'fadeIn 0.2s ease-in-out',
        minWidth: '400px',
        maxHeight: '80vh',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className={`w-10 h-10 ${columnColor} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
          {(email.sender.name || email.sender.email).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900">
            {email.sender.name || email.sender.email}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(email.date)}
          </div>
        </div>
        {email.unread && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
        {email.priority === 'high' && (
          <span className="text-red-500 text-lg">🔥</span>
        )}
      </div>

      {/* Subject */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1 font-medium">Subject:</div>
        <h4 className="font-semibold text-gray-900 text-base">
          {email.subject}
        </h4>
      </div>

      {/* Recipients */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1 font-medium">To:</div>
        <div className="text-sm text-gray-700">
          {email.recipients.map(recipient => recipient.name || recipient.email).join(', ')}
        </div>
      </div>

      {/* Message Body */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2 font-medium">Message:</div>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {email.body || email.snippet || 'No message content available.'}
        </div>
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="border-t border-gray-200 pt-3 mb-3">
          <div className="text-xs text-gray-500 mb-2 font-medium">Attachments:</div>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <span className="text-sm">📎</span>
            <span className="text-sm">
              {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-1">
            {email.attachments.map((attachment, index) => (
              <div key={attachment.id || index} className="text-sm text-gray-600 pl-6">
                • {attachment.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority indicator */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="text-sm text-gray-500 capitalize">
          Priority: <span className="font-medium">{email.priority}</span>
        </div>
        <div className="text-sm text-gray-500">
          Status: <span className="font-medium">
            {email.archived ? 'Archived' : email.unread ? 'Unread' : 'Read'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageTooltip;
