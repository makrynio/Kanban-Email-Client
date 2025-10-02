import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Star, Paperclip } from 'lucide-react'
import { Email, KanbanColumn as KanbanColumnType } from '../types'

interface KanbanBoardProps {
  folder: string
  onEmailSelect: (email: Email) => void
}

// Sortable email item component
const SortableEmailItem = ({ email, onEmailSelect }: { email: Email; onEmailSelect: (email: Email) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: email.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }



  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`email-card mb-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      onClick={() => onEmailSelect(email)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {email.unread && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
          {email.priority === 'high' && (
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
          )}
          <span className="font-medium text-sm text-gray-900 truncate">
            {email.sender.name || email.sender.email}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {email.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
        {email.subject}
      </h4>
      
      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
        {email.snippet || email.body}
      </p>
      
      <div className="flex items-center justify-between">
        {email.attachments.length > 0 && (
          <div className="flex items-center gap-1 text-gray-500">
            <Paperclip className="w-3 h-3" />
            <span className="text-xs">{email.attachments.length}</span>
          </div>
        )}
        <div className="text-xs text-gray-400">
          {email.priority}
        </div>
      </div>
    </div>
  )
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ folder, onEmailSelect }) => {
  const [columns, setColumns] = useState<KanbanColumnType[]>([
    {
      id: 'unread',
      title: 'Unread',
      emails: [
        {
          id: '1',
          subject: 'Project Update Meeting',
          sender: { name: 'John Doe', email: 'john@example.com' },
          recipients: [{ name: 'Me', email: 'me@example.com' }],
          body: 'Hi, let\'s schedule a meeting to discuss the project updates...',
          snippet: 'Hi, let\'s schedule a meeting to discuss the project updates...',
          date: new Date('2024-01-15T10:30:00'),
          unread: true,
          archived: false,
          priority: 'medium',
          attachments: [{ id: '1', name: 'project.pdf', size: 1024000, type: 'application/pdf' }]
        },
        {
          id: '2',
          subject: 'Weekly Report',
          sender: { name: 'Sarah Johnson', email: 'sarah@company.com' },
          recipients: [{ name: 'Me', email: 'me@example.com' }],
          body: 'Here\'s the weekly report for your review...',
          snippet: 'Here\'s the weekly report for your review...',
          date: new Date('2024-01-15T09:15:00'),
          unread: true,
          archived: false,
          priority: 'low',
          attachments: []
        }
      ]
    },
    {
      id: 'read',
      title: 'Read',
      emails: [
        {
          id: '3',
          subject: 'Your ticket has been resolved',
          sender: { name: 'Support Team', email: 'support@service.com' },
          recipients: [{ name: 'Me', email: 'me@example.com' }],
          body: 'We have resolved your support ticket...',
          snippet: 'We have resolved your support ticket...',
          date: new Date('2024-01-14T16:45:00'),
          unread: false,
          archived: false,
          priority: 'low',
          attachments: []
        }
      ]
    },
    {
      id: 'flagged',
      title: 'Flagged',
      emails: [
        {
          id: '4',
          subject: 'Important: Q1 Goals',
          sender: { name: 'Boss', email: 'boss@company.com' },
          recipients: [{ name: 'Me', email: 'me@example.com' }],
          body: 'Please review the Q1 goals document...',
          snippet: 'Please review the Q1 goals document...',
          date: new Date('2024-01-13T14:20:00'),
          unread: false,
          archived: false,
          priority: 'high',
          attachments: [{ id: '2', name: 'q1-goals.docx', size: 512000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }]
        }
      ]
    }
  ])

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeEmail = columns.flatMap(col => col.emails).find(email => email.id === active.id)
      const overEmail = columns.flatMap(col => col.emails).find(email => email.id === over.id)
      
      if (activeEmail && overEmail) {
        const activeColumn = columns.find(col => col.emails.some(email => email.id === active.id))
        const overColumn = columns.find(col => col.emails.some(email => email.id === over.id))
        
        if (activeColumn && overColumn) {
          const newColumns = [...columns]
          
          // Remove from source column
          const sourceColumnIndex = newColumns.findIndex(col => col.id === activeColumn.id)
          const sourceEmailIndex = newColumns[sourceColumnIndex].emails.findIndex(email => email.id === active.id)
          const [movedEmail] = newColumns[sourceColumnIndex].emails.splice(sourceEmailIndex, 1)
          
          // Add to destination column
          const destColumnIndex = newColumns.findIndex(col => col.id === overColumn.id)
          const destEmailIndex = newColumns[destColumnIndex].emails.findIndex(email => email.id === over.id)
          newColumns[destColumnIndex].emails.splice(destEmailIndex, 0, movedEmail)
          
          setColumns(newColumns)
        }
      }
    }
    
    setActiveId(null)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 capitalize">{folder}</h2>
        <p className="text-gray-600">Organize your emails with drag and drop</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-[320px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                    {column.emails.length}
                  </span>
                </div>

                <div className="min-h-[400px] rounded">
                  <SortableContext
                    items={column.emails.map(email => email.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {column.emails.map((email) => (
                      <SortableEmailItem
                        key={email.id}
                        email={email}
                        onEmailSelect={onEmailSelect}
                      />
                    ))}
                  </SortableContext>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="email-card p-3 bg-white border border-gray-200 rounded-lg shadow-lg opacity-80">
              <div className="text-sm text-gray-600">Dragging...</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default KanbanBoard
