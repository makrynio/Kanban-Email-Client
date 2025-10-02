import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Trash2 } from 'lucide-react';
import { demoEmailService } from './services/DemoEmailService';
import { DemoEmail, DemoLabel } from './types';
import { useTooltip } from './hooks/useTooltip';
import { useDragHold } from './hooks/useDragHold';
import MessageTooltip from './components/MessageTooltip';
import EmailModal from './components/EmailModal';
import { GmailAuthProvider, useGmailAuth } from './components/GmailAuthProvider';
import { gmailService } from './services/GmailService';
import { OAUTH_CONFIG } from './config/oauth';
import GmailSetupInstructions from './components/GmailSetupInstructions';

// Sortable email item component
const SortableEmailItem = ({ email, column, onEmailClick, onTrashClick }: { email: DemoEmail; column: any; onEmailClick: (email: DemoEmail) => void; onTrashClick: (email: DemoEmail) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: email.id })

  const {
    isVisible,
    position,
    tooltipRef,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove,
  } = useTooltip({ delay: 1000 })

  const {
    isHolding,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave: handleDragMouseLeave,
  } = useDragHold({ holdDelay: 500 })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onMouseEnter={(e) => {
          handleMouseEnter(e);
        }}
        onMouseLeave={(e) => {
          handleMouseLeave();
          handleDragMouseLeave();
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={(e) => {
          // Only handle click if not in a drag operation and not holding
          if (!isDragging && !isHolding) {
            e.preventDefault();
            e.stopPropagation();
            onEmailClick(email);
          }
        }}
        className={`group mb-3 p-4 rounded-lg shadow-sm border bg-white cursor-pointer transition-all relative ${
          isDragging 
            ? 'shadow-lg rotate-2 cursor-grabbing transform scale-105' 
            : isHolding
            ? 'shadow-md bg-blue-50 border-blue-200'
            : 'hover:bg-gray-50 hover:shadow-md'
        }`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-8 h-8 ${column.avatar} rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
            {(email.sender.name || email.sender.email).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 truncate">
                {email.sender.name || email.sender.email}
              </span>
              {email.unread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              {email.priority === 'high' && (
                <span className="text-red-500 text-xs">🔥</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {email.subject}
        </h4>
        <p className="text-sm text-gray-600 line-clamp-2">
          {email.snippet}
        </p>
        {email.attachments && email.attachments.length > 0 && (
          <div className="flex items-center gap-1 mt-2 text-gray-500">
            <span className="text-xs">📎</span>
            <span className="text-xs">{email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}</span>
          </div>
        )}
        
        {/* Trash button - absolute positioned in upper right corner */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTrashClick(email);
          }}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 z-10"
          title="Move to trash"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Hold indicator */}
        {isHolding && (
          <div className="absolute top-8 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            Hold to drag
          </div>
        )}
      </div>
      
      {/* Message Tooltip */}
      <MessageTooltip
        email={email}
        position={position}
        isVisible={isVisible}
        tooltipRef={tooltipRef}
        columnColor={column.avatar}
      />
    </>
  )
}

// Droppable column component
const DroppableColumn = ({ column, children }: { column: any; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[400px] p-2 bg-white border-2 border-t-0 rounded-b-lg border-gray-200 transition-colors ${
        isOver ? 'border-blue-300 bg-blue-50' : ''
      }`}
    >
      {children}
    </div>
  )
}

function KanbanBoard() {
  const { isAuthenticated, authenticateUser, signOut } = useGmailAuth();
  const [folders, setFolders] = useState<DemoLabel[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [messages, setMessages] = useState<DemoEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<DemoEmail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);
  
  // Kanban columns state
  const [columns, setColumns] = useState({
    todo: { 
      id: 'todo', 
      title: 'To Do', 
      color: 'bg-blue-50 border-blue-200',
      avatar: 'bg-blue-500',
      emails: [] as DemoEmail[]
    },
    inProgress: { 
      id: 'inProgress', 
      title: 'In Progress', 
      color: 'bg-yellow-50 border-yellow-200',
      avatar: 'bg-yellow-500',
      emails: [] as DemoEmail[]
    },
    done: { 
      id: 'done', 
      title: 'Done', 
      color: 'bg-green-50 border-green-200',
      avatar: 'bg-green-500',
      emails: [] as DemoEmail[]
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250, // 0.25 second delay before drag starts
        tolerance: 5, // Allow 5px movement before canceling
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load data when authentication status changes or component mounts
  useEffect(() => {
    loadEmailData();
  }, [isAuthenticated]);

  // Save kanban state to localStorage
  const saveKanbanState = (columnsToSave: typeof columns) => {
    try {
      if (!selectedFolder) return;
      
      const stateToSave = {
        columns: columnsToSave,
        timestamp: new Date().toISOString()
      };
      const storageKey = `email-kanban-state-${selectedFolder}`;
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      console.log(`Kanban state saved for folder: ${selectedFolder}`);
    } catch (error) {
      console.error('Failed to save kanban state:', error);
    }
  };

  // Load kanban state from localStorage (folder-specific)
  const loadKanbanState = (folderId: string) => {
    try {
      const storageKey = `email-kanban-state-${folderId}`;
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Convert date strings back to Date objects
        Object.values(parsedState.columns).forEach((column: any) => {
          column.emails.forEach((email: any) => {
            email.date = new Date(email.date);
          });
        });
        console.log(`Kanban state loaded for folder: ${folderId}`);
        return parsedState.columns;
      }
    } catch (error) {
      console.error('Failed to load kanban state:', error);
    }
    return null;
  };

  // Clear saved kanban state for current folder
  const clearKanbanState = () => {
    try {
      if (!selectedFolder) return;
      
      const storageKey = `email-kanban-state-${selectedFolder}`;
      localStorage.removeItem(storageKey);
      console.log(`Kanban state cleared for folder: ${selectedFolder}`);
      
      // Reload the current folder to reset to default categorization
      handleFolderSelect(selectedFolder);
    } catch (error) {
      console.error('Failed to clear kanban state:', error);
    }
  };

  // Clear all kanban states for all folders
  const clearAllKanbanStates = () => {
    try {
      // Get all localStorage keys and remove kanban states
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('email-kanban-state-')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared kanban states for ${keysToRemove.length} folders`);
      
      // Reload the current folder
      if (selectedFolder) {
        handleFolderSelect(selectedFolder);
      }
    } catch (error) {
      console.error('Failed to clear all kanban states:', error);
    }
  };

    const loadEmailData = async () => {
    try {
      setLoading(true);
      console.log('Loading email data, authenticated:', isAuthenticated);
      
      if (!isAuthenticated) {
        console.log('Not authenticated, clearing data');
        setFolders([]);
        setMessages([]);
        setColumns({
          todo: { ...columns.todo, emails: [] },
          inProgress: { ...columns.inProgress, emails: [] },
          done: { ...columns.done, emails: [] }
        });
        return;
      }

      // Load real Gmail data only
      console.log('Initializing Gmail service...');
      await gmailService.initialize();
      const gmailLabels = await gmailService.getLabels();
      console.log('Gmail labels loaded:', gmailLabels.length);
      
      // Filter to main folders only (exclude system labels)
      const mainLabels = gmailLabels.filter(label => 
        ['INBOX', 'SENT', 'DRAFT', 'TRASH', 'SPAM'].includes(label.id) ||
        label.type === 'user'
      );
      
      // Convert Gmail labels to DemoLabel format
      const convertedFolders: DemoLabel[] = mainLabels.map(label => ({
        id: label.id,
        name: label.name,
        unreadCount: label.messagesUnread || 0,
        totalCount: label.messagesTotal || 0
      }));
      
      setFolders(convertedFolders);
      console.log('Folders set:', convertedFolders.length);
      
      if (convertedFolders.length > 0) {
        const inboxFolder = convertedFolders.find(f => f.id === 'INBOX') || convertedFolders[0];
        setSelectedFolder(inboxFolder.id);
        
        // Load messages for the initial folder
        await loadMessagesForFolder(inboxFolder.id);
      }
    } catch (error) {
      console.error('Error loading email data:', error);
      alert(`Failed to load emails: ${error.message || error}. Please check your connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const loadMessagesForFolder = async (folderId: string) => {
    try {
      console.log('Loading messages for folder:', folderId);
      
      await gmailService.initialize();
      const gmailMessages = await gmailService.getMessages(folderId);
      console.log('Received messages for', folderId, ':', gmailMessages.length);
      
      // Convert Gmail messages to DemoEmail format
      const convertedMessages: DemoEmail[] = gmailMessages.map(msg => ({
        id: msg.id,
        subject: msg.subject,
        sender: {
          name: msg.from.split('<')[0].trim(),
          email: msg.from.includes('<') ? msg.from.split('<')[1].replace('>', '') : msg.from
        },
        recipients: [{ name: 'Me', email: 'me@gmail.com' }],
        body: msg.snippet,
        snippet: msg.snippet,
        date: msg.date,
        attachments: [],
        unread: !msg.isRead,
        archived: msg.labels.includes('TRASH'),
        priority: 'medium' as const
      }));
      
      setMessages(convertedMessages);
      categorizeEmails(convertedMessages);
      console.log('Converted and categorized', convertedMessages.length, 'messages for folder', folderId);
    } catch (error) {
      console.error('Error loading messages for folder:', folderId, error);
      throw error;
    }
  };

  const categorizeEmails = (emails: DemoEmail[]) => {
    // First, try to load saved kanban state for the current folder
    const savedColumns = selectedFolder ? loadKanbanState(selectedFolder) : null;
    
    if (savedColumns) {
      // Check if we have new emails that aren't in the saved state
      const savedEmailIds = Object.values(savedColumns).flatMap((col: any) => col.emails.map((email: any) => email.id));
      const newEmails = emails.filter(email => !savedEmailIds.includes(email.id));
      
      // Add new emails to the appropriate default columns
      const updatedColumns = { ...savedColumns };
      newEmails.forEach(email => {
        if (email.unread) {
          updatedColumns.todo.emails.push(email);
        } else if (email.archived) {
          updatedColumns.done.emails.push(email);
        } else {
          updatedColumns.inProgress.emails.push(email);
        }
      });
      
      setColumns(updatedColumns);
    } else {
      // No saved state, use default categorization
    setColumns(prev => ({
      todo: {
        ...prev.todo,
        emails: emails.filter(email => email.unread)
      },
      inProgress: {
        ...prev.inProgress,
        emails: emails.filter(email => !email.unread && !email.archived)
      },
      done: {
        ...prev.done,
        emails: emails.filter(email => email.archived)
      }
    }));
    }
  };

  const handleFolderSelect = async (folderId: string) => {
    try {
      setLoading(true);
      console.log('Folder selected:', folderId, 'Current folder:', selectedFolder);
      
      // Skip if already loading this folder
      if (loading && selectedFolder === folderId) {
        console.log('Already loading this folder, skipping');
        return;
      }
      
      // Immediately clear the current board and set the new folder
      setColumns({
        todo: { ...columns.todo, emails: [] },
        inProgress: { ...columns.inProgress, emails: [] },
        done: { ...columns.done, emails: [] }
      });
      setMessages([]);
      setSelectedFolder(folderId);
      
      if (!isAuthenticated) {
        console.log('Not authenticated, cannot load folder');
        return;
      }

      // Load real Gmail messages for the selected folder
      await loadMessagesForFolder(folderId);
      console.log('Folder loading completed for:', folderId);
    } catch (error) {
      console.error('Error loading messages for folder:', error);
      alert(`Failed to load folder messages: ${error.message || error}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (email: DemoEmail) => {
    setSelectedEmail(email);
    setIsModalOpen(true);
  };

  const handleTrashClick = async (email: DemoEmail) => {
    try {
      if (!isAuthenticated) {
        alert('Please authenticate with Gmail to perform this action.');
      return;
    }

      console.log('Moving email to trash:', email.subject);
      
      // Move to trash in Gmail
      await gmailService.moveToTrash(email.id);
      
      // Remove from current view
      setColumns(prevColumns => {
        const newColumns = { ...prevColumns };
        Object.keys(newColumns).forEach(columnId => {
          newColumns[columnId] = {
            ...newColumns[columnId],
            emails: newColumns[columnId].emails.filter(e => e.id !== email.id)
          };
        });
        // Save updated state
        saveKanbanState(newColumns);
        return newColumns;
      });
      
      // Remove from messages
      setMessages(prevMessages => prevMessages.filter(m => m.id !== email.id));
      
      console.log('Email moved to trash successfully:', email.subject);
    } catch (error) {
      console.error('Error moving email to trash:', error);
      alert(`Failed to move email to trash: ${error.message || error}. Please try again.`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmail(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeEmail = Object.values(columns).flatMap(col => col.emails).find(email => email.id === active.id)
    
    if (!activeEmail) {
      setActiveId(null)
      return
    }

    // Find the source column
    const activeColumnId = Object.keys(columns).find(key => 
      columns[key as keyof typeof columns].emails.some(email => email.id === active.id)
    ) as keyof typeof columns

    // Determine destination column - prioritize column drops over email drops
    let destColumnId: keyof typeof columns | null = null
    
    // Check if we're dropping directly on a column (these are the droppable zones)
    if (over.id === 'todo' || over.id === 'inProgress' || over.id === 'done') {
      destColumnId = over.id as keyof typeof columns
      console.log('Dropped on column:', destColumnId)
    } else {
      // We're dropping on an email, find which column it belongs to
      // But only consider emails from the current folder to avoid cross-folder confusion
      for (const [columnKey, column] of Object.entries(columns)) {
        if (column.emails.some(email => email.id === over.id)) {
          destColumnId = columnKey as keyof typeof columns
          console.log('Dropped on email in column:', destColumnId, 'email:', over.id)
          break
        }
      }
    }
    
    console.log('Drag from:', activeColumnId, 'to:', destColumnId)

    if (activeColumnId && destColumnId && activeColumnId !== destColumnId) {
      const newColumns = { ...columns }
      
      // Remove from source column
      const sourceColumn = newColumns[activeColumnId]
      const sourceEmailIndex = sourceColumn.emails.findIndex(email => email.id === active.id)
      const [movedEmail] = sourceColumn.emails.splice(sourceEmailIndex, 1)
      
      // Add to destination column (at the end)
      const destColumn = newColumns[destColumnId]
      destColumn.emails.push(movedEmail)

      // Update email properties and Gmail labels based on destination column
      let gmailLabelsToAdd: string[] = [];
      let gmailLabelsToRemove: string[] = [];

      if (destColumnId === 'todo') {
        movedEmail.unread = true;
        movedEmail.archived = false;
        gmailLabelsToAdd = ['UNREAD', 'INBOX'];
      } else if (destColumnId === 'inProgress') {
        movedEmail.unread = false;
        movedEmail.archived = false;
        gmailLabelsToRemove = ['UNREAD'];
        gmailLabelsToAdd = ['INBOX'];
      } else if (destColumnId === 'done') {
        movedEmail.unread = false;
        movedEmail.archived = true;
        gmailLabelsToRemove = ['UNREAD', 'INBOX'];
      }
      
      // Update Gmail labels if authenticated
      if (isAuthenticated) {
        gmailService.updateEmailLabels(movedEmail.id, gmailLabelsToAdd, gmailLabelsToRemove)
          .then(() => {
            console.log(`Updated Gmail labels for email ${movedEmail.id}: +${gmailLabelsToAdd.join(',')} -${gmailLabelsToRemove.join(',')}`);
          })
          .catch(error => {
            console.error('Failed to update Gmail labels:', error);
          });
      }
      
      setColumns(newColumns)
      
      // Save the updated state to localStorage
      saveKanbanState(newColumns)

      // Update the main messages array to reflect the changes
      setMessages(prev => 
        prev.map(email => 
          email.id === active.id ? movedEmail : email
        )
      )
    }
    
    setActiveId(null)
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Email Kanban</h2>
        <div className="space-y-1">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => handleFolderSelect(folder.id)}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="truncate">{folder.name}</span>
              {folder.unreadCount > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {folder.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {selectedFolder && folders.length > 0 
              ? `${folders.find(f => f.id === selectedFolder)?.name || selectedFolder} - Kanban Board`
              : 'Email Kanban Board'
            }
          </h2>
              <p className="text-gray-600">
                {isAuthenticated 
                  ? `Connected to Gmail • ${messages.length} messages loaded${selectedFolder ? ' from ' + (folders.find(f => f.id === selectedFolder)?.name || selectedFolder) : ''}` 
                  : 'Not connected to Gmail - Please authenticate to load your emails'
                }
              </p>
            </div>
            <div className="flex gap-3">
              {(
                <>
                  {!isAuthenticated ? (
                    <>
                      <button
                        onClick={() => setShowSetupInstructions(true)}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        Setup Instructions
                      </button>
                      <button
                        onClick={authenticateUser}
                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Connect Gmail
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={signOut}
                      className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  )}
                </>
              )}
              <button
                onClick={clearKanbanState}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                title="Reset this folder's kanban board to default positions"
              >
                Reset This Board
              </button>
              <button
                onClick={clearAllKanbanStates}
                className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                title="Reset all folder kanban boards to default positions"
              >
                Reset All Boards
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading emails...</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(columns).map((column) => (
                <div key={column.id} className="flex flex-col">
                  {/* Column Header */}
                  <div className={`p-4 rounded-t-lg border-2 ${column.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5">
                        {column.id === 'todo' && '📧'}
                        {column.id === 'inProgress' && '⏰'}
                        {column.id === 'done' && '✅'}
                      </span>
                      <h3 className="font-semibold text-gray-800">{column.title}</h3>
                      <span className="ml-auto bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                        {column.emails.length}
                      </span>
                    </div>
                  </div>

                  {/* Droppable Column */}
                  <DroppableColumn column={column}>
                    <SortableContext
                      items={column.emails.map(email => email.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {column.emails.map((email) => (
                        <SortableEmailItem
                          key={email.id}
                          email={email}
                          column={column}
                          onEmailClick={handleEmailClick}
                          onTrashClick={handleTrashClick}
                        />
                      ))}
                    </SortableContext>
                  </DroppableColumn>
                </div>
              ))}
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="p-4 rounded-lg shadow-lg border bg-white opacity-80">
                  <div className="text-sm text-gray-600">Dragging...</div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Email Modal */}
      <EmailModal
        email={selectedEmail}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        columnColor={selectedEmail ? Object.values(columns).find(col => 
          col.emails.some(email => email.id === selectedEmail.id)
        )?.avatar : undefined}
      />

      {/* Setup Instructions Modal */}
      {showSetupInstructions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={(e) => e.target === e.currentTarget && setShowSetupInstructions(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSetupInstructions(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <GmailSetupInstructions />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <GmailAuthProvider>
      <KanbanBoard />
    </GmailAuthProvider>
  );
}

export default App;