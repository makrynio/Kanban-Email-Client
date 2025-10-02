import React from 'react'
import { X, Reply, Forward, Archive, Trash2, Star, Download, Paperclip } from 'lucide-react'
import { Email } from '../types'

interface EmailViewerProps {
  email: Email
  onClose: () => void
}

const EmailViewer: React.FC<EmailViewerProps> = ({ email, onClose }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Email</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Subject */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {email.subject}
        </h2>

        {/* Email Meta */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {email.from.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{email.from}</p>
                <p className="text-sm text-gray-500">to {email.to}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{formatDate(email.timestamp)}</p>
              <div className="flex items-center gap-1 mt-1">
                {email.status === 'flagged' && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
                <span className="text-xs text-gray-400 capitalize">{email.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments */}
        {email.attachments.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments ({email.attachments.length})
            </h4>
            <div className="space-y-2">
              {email.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{attachment.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Body */}
        <div className="prose prose-sm max-w-none">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-700 whitespace-pre-wrap">{email.body}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            <Reply className="w-4 h-4" />
            Reply
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Forward className="w-4 h-4" />
            Forward
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Archive className="w-4 h-4" />
            Archive
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Star className="w-4 h-4" />
            Flag
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailViewer
