import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { DemoEmail } from '../types';

interface BaseActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (content: string) => Promise<void>;
  email: DemoEmail | null;
}

interface ReplyModalProps extends BaseActionModalProps {
  isReplyAll?: boolean;
}

interface ForwardModalProps extends BaseActionModalProps {
  onSend: (content: string, recipients: string) => Promise<void>;
}

const ReplyModal: React.FC<ReplyModalProps> = ({ isOpen, onClose, onSend, email, isReplyAll = false }) => {
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!replyContent.trim()) return;
    
    setIsLoading(true);
    try {
      await onSend(replyContent);
      setReplyContent('');
      onClose(); // Close the reply modal
    } catch (error) {
      console.error('Failed to send reply:', error);
      // Error handling is done in the parent EmailModal
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  };

  if (!isOpen || !email) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isReplyAll ? 'Reply All' : 'Reply'} to: {email.subject}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Email Details */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="text-sm">
            <div className="mb-2">
              <span className="font-medium">To: </span>
              <span>{email.sender.name || email.sender.email}</span>
            </div>
            {isReplyAll && email.recipients.length > 1 && (
              <div className="mb-2">
                <span className="font-medium">Cc: </span>
                <span>{email.recipients.filter((r, i) => i > 0).map(r => r.name || r.email).join(', ')}</span>
              </div>
            )}
            <div>
              <span className="font-medium">Subject: </span>
              <span>Re: {email.subject}</span>
            </div>
          </div>
        </div>

        {/* Compose Area */}
        <div className="px-6 py-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your reply here..."
            className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <div className="text-xs text-gray-500 mt-2">
            Press Ctrl+Enter to send, Escape to cancel
          </div>
        </div>

        {/* Original Message */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <details className="group">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
              Show original message
            </summary>
            <div className="mt-3 p-3 bg-white border border-gray-200 rounded">
              <div className="text-sm text-gray-600 mb-2">
                From: {email.sender.name || email.sender.email} | {email.date.toLocaleString()}
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {email.body || email.snippet}
              </div>
            </div>
          </details>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {replyContent.length} characters
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!replyContent.trim() || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ForwardModal: React.FC<ForwardModalProps> = ({ isOpen, onClose, onSend, email }) => {
  const [forwardContent, setForwardContent] = useState('');
  const [recipients, setRecipients] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!forwardContent.trim() || !recipients.trim()) return;
    
    setIsLoading(true);
    try {
      await onSend(forwardContent, recipients);
      setForwardContent('');
      setRecipients('');
      onClose(); // Close the forward modal
    } catch (error) {
      console.error('Failed to forward email:', error);
      // Error handling is done in the parent EmailModal
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  };

  if (!isOpen || !email) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Forward: {email.subject}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Recipients */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To: (separate multiple emails with commas)
          </label>
          <input
            type="email"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="recipient@example.com, another@example.com"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            multiple
          />
        </div>

        {/* Compose Area */}
        <div className="px-6 py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message:
          </label>
          <textarea
            value={forwardContent}
            onChange={(e) => setForwardContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add your message here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="text-xs text-gray-500 mt-2">
            Press Ctrl+Enter to send, Escape to cancel
          </div>
        </div>

        {/* Original Message Preview */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="text-sm font-medium text-gray-700 mb-3">Forwarded message:</div>
          <div className="p-3 bg-white border border-gray-200 rounded">
            <div className="text-sm text-gray-600 mb-2">
              <div>From: {email.sender.name || email.sender.email}</div>
              <div>Date: {email.date.toLocaleString()}</div>
              <div>Subject: {email.subject}</div>
            </div>
            <div className="text-sm text-gray-800 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {email.body || email.snippet}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {forwardContent.length} characters
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!forwardContent.trim() || !recipients.trim() || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Forwarding...' : 'Forward'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ReplyModal, ForwardModal };
