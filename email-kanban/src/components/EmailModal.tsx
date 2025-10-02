import React, { useEffect, useState } from 'react';
import { X, Reply, ReplyAll, Forward, Flag, Paperclip } from 'lucide-react';
import { DemoEmail } from '../types';
import { ReplyModal, ForwardModal } from './EmailActionModals';
import { gmailService } from '../services/GmailService';

interface EmailModalProps {
  email: DemoEmail | null;
  isOpen: boolean;
  onClose: () => void;
  columnColor?: string;
}

const EmailModal: React.FC<EmailModalProps> = ({
  email,
  isOpen,
  onClose,
  columnColor = 'bg-blue-500',
}) => {
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyAllModalOpen, setReplyAllModalOpen] = useState(false);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleReply = async (content: string) => {
    if (!email?.id) return;
    
    try {
      console.log('Sending reply to email:', email.id);
      await gmailService.sendReply(email.id, content, false);
      alert('Reply sent successfully!');
      onClose(); // Close the main modal after successful send
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert(`Failed to send reply: ${error.message || error}. Please try again.`);
      throw error; // Re-throw so the ReplyModal can handle it
    }
  };

  const handleReplyAll = async (content: string) => {
    if (!email?.id) return;
    
    try {
      console.log('Sending reply-all to email:', email.id);
      await gmailService.sendReply(email.id, content, true);
      alert('Reply All sent successfully!');
      onClose(); // Close the main modal after successful send
    } catch (error) {
      console.error('Failed to send reply all:', error);
      alert(`Failed to send reply all: ${error.message || error}. Please try again.`);
      throw error; // Re-throw so the ReplyModal can handle it
    }
  };

  const handleForward = async (content: string, recipients: string) => {
    if (!email?.id) return;
    
    try {
      console.log('Forwarding email:', email.id, 'to:', recipients);
      await gmailService.sendForward(email.id, recipients, content);
      alert('Email forwarded successfully!');
      onClose(); // Close the main modal after successful send
    } catch (error) {
      console.error('Failed to forward email:', error);
      alert(`Failed to forward email: ${error.message || error}. Please try again.`);
      throw error; // Re-throw so the ForwardModal can handle it
    }
  };

  const handleSpam = async () => {
    if (!email?.id) return;
    
    if (confirm('Mark this email as spam?')) {
      try {
        await gmailService.markAsSpam(email.id);
        alert('Email marked as spam');
        onClose();
      } catch (error) {
        console.error('Failed to mark as spam:', error);
        alert('Failed to mark as spam. Please try again.');
      }
    }
  };

  if (!isOpen || !email) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${columnColor} rounded-full flex items-center justify-center text-white text-lg font-medium`}>
              {(email.sender.name || email.sender.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {email.subject}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{email.sender.name || email.sender.email}</span>
                {email.unread && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Unread
                  </span>
                )}
                {email.priority === 'high' && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                    High Priority
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Email Details */}
        <div className="px-6 py-4">
          {/* From/To/Date Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <span className="text-sm font-medium text-gray-500 w-16">From:</span>
                <div>
                  <div className="font-medium text-gray-900">
                    {email.sender.name || email.sender.email}
                  </div>
                  {email.sender.name && (
                    <div className="text-sm text-gray-600">{email.sender.email}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-sm font-medium text-gray-500 w-16">To:</span>
                <div className="text-gray-900">
                  {email.recipients.map((recipient, index) => (
                    <div key={index}>
                      <span className="font-medium">
                        {recipient.name || recipient.email}
                      </span>
                      {recipient.name && (
                        <span className="text-sm text-gray-600 ml-2">{recipient.email}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-sm font-medium text-gray-500 w-16">Date:</span>
                <span className="text-gray-900">{formatDate(email.date)}</span>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {email.subject}
            </h3>
          </div>

          {/* Message Body */}
          <div className="mb-6">
            <div className="prose max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
                {email.body || email.snippet || 'No message content available.'}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Attachments ({email.attachments.length})
              </h4>
              <div className="grid gap-3">
                {email.attachments.map((attachment, index) => (
                  <div
                    key={attachment.id || index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Paperclip className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{attachment.name}</div>
                      <div className="text-sm text-gray-500">{formatFileSize(attachment.size)}</div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setReplyModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
              
              <button
                onClick={() => setReplyAllModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ReplyAll className="w-4 h-4" />
                Reply All
              </button>
              
              <button
                onClick={() => setForwardModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Forward className="w-4 h-4" />
                Forward
              </button>
            </div>
            
            <button
              onClick={handleSpam}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Flag className="w-4 h-4" />
              Spam
            </button>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <ReplyModal
        isOpen={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        onSend={handleReply}
        email={email}
      />

      <ReplyModal
        isOpen={replyAllModalOpen}
        onClose={() => setReplyAllModalOpen(false)}
        onSend={handleReplyAll}
        email={email}
        isReplyAll={true}
      />

      <ForwardModal
        isOpen={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        onSend={handleForward}
        email={email}
      />
    </div>
  );
};

export default EmailModal;
