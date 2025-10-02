import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Mail, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { ParsedEmail, DemoEmail } from '../types';

interface KanbanColumn {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  emails: (ParsedEmail | DemoEmail)[];
}

interface KanbanBoardProps {
  emails: (ParsedEmail | DemoEmail)[];
  onEmailSelect?: (email: ParsedEmail | DemoEmail) => void;
  selectedEmail?: ParsedEmail | DemoEmail | null;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ emails, onEmailSelect, selectedEmail }) => {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'todo',
      title: 'To Do',
      icon: <Mail className="w-5 h-5" />,
      color: 'bg-blue-50 border-blue-200',
      emails: []
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-yellow-50 border-yellow-200',
      emails: []
    },
    {
      id: 'done',
      title: 'Done',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-green-50 border-green-200',
      emails: []
    }
  ]);

  // Categorize emails into columns
  useEffect(() => {
    if (!emails.length) return;

    const categorizedColumns = columns.map(col => {
      let columnEmails: (ParsedEmail | DemoEmail)[] = [];

      switch (col.id) {
        case 'todo':
          // Unread emails and new emails go to To Do
          columnEmails = emails.filter(email => 
            'unread' in email ? email.unread : true
          );
          break;
        case 'in-progress':
          // Emails that have been opened but not completed
          columnEmails = emails.filter(email => 
            'unread' in email ? !email.unread && !email.archived : false
          );
          break;
        case 'done':
          // Archived or completed emails
          columnEmails = emails.filter(email => 
            'archived' in email ? email.archived : false
          );
          break;
      }

      return { ...col, emails: columnEmails };
    });

    setColumns(categorizedColumns);
  }, [emails]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const sourceEmails = Array.from(sourceColumn.emails);
    const destEmails = Array.from(destColumn.emails);

    const [movedEmail] = sourceEmails.splice(source.index, 1);
    
    if (source.droppableId === destination.droppableId) {
      // Moving within the same column
      sourceEmails.splice(destination.index, 0, movedEmail);
      
      const newColumns = columns.map(col => 
        col.id === source.droppableId 
          ? { ...col, emails: sourceEmails }
          : col
      );
      setColumns(newColumns);
    } else {
      // Moving to a different column
      destEmails.splice(destination.index, 0, movedEmail);
      
      const newColumns = columns.map(col => {
        if (col.id === source.droppableId) {
          return { ...col, emails: sourceEmails };
        }
        if (col.id === destination.droppableId) {
          return { ...col, emails: destEmails };
        }
        return col;
      });
      setColumns(newColumns);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Kanban Board</h2>
        <p className="text-gray-600">Drag emails between columns to organize your workflow</p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col">
              <div className={`p-4 rounded-t-lg border-2 ${column.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  {column.icon}
                  <h3 className="font-semibold text-gray-800">{column.title}</h3>
                  <span className="ml-auto bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                    {column.emails.length}
                  </span>
                </div>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] p-2 bg-white border-2 border-t-0 rounded-b-lg ${
                      snapshot.isDraggingOver ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {column.emails.map((email, index) => (
                      <Draggable
                        key={email.id}
                        draggableId={email.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 p-4 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                            } ${
                              selectedEmail?.id === email.id 
                                ? 'ring-2 ring-blue-500 bg-blue-50' 
                                : 'bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => onEmailSelect?.(email)}
                          >
                            {/* Email Header */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                {getInitials(email.sender.name || email.sender.email)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 truncate">
                                    {email.sender.name || email.sender.email}
                                  </span>
                                  {('unread' in email && email.unread) && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(email.date)}
                                </div>
                              </div>
                            </div>

                            {/* Subject */}
                            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                              {email.subject}
                            </h4>

                            {/* Preview */}
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {email.snippet || email.body?.substring(0, 100)}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Mail className="w-3 h-3" />
                                {email.attachments?.length || 0} attachments
                              </div>
                              {('priority' in email && email.priority === 'high') && (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
