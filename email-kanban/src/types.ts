export interface Email {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
  };
  recipients: {
    name: string;
    email: string;
  }[];
  body: string;
  snippet?: string;
  date: Date;
  attachments: Attachment[];
  unread: boolean;
  archived: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface Folder {
  id: string;
  name: string;
  unreadCount: number;
  totalCount: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  emails: Email[];
}

export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    index: number;
    droppableId: string;
  };
  destination?: {
    index: number;
    droppableId: string;
  };
}

// Gmail API types
export interface GmailLabel {
  id: string;
  name: string;
  messageListVisibility: string;
  labelListVisibility: string;
  type: string;
  messagesTotal: number;
  messagesUnread: number;
  threadsTotal: number;
  threadsUnread: number;
}

export interface ParsedEmail {
  id: string;
  threadId: string;
  subject: string;
  sender: {
    name: string;
    email: string;
  };
  recipients: {
    name: string;
    email: string;
  }[];
  body: string;
  snippet: string;
  date: Date;
  attachments: Attachment[];
  unread: boolean;
  archived: boolean;
  priority: 'low' | 'medium' | 'high';
}

// Demo types
export interface DemoLabel {
  id: string;
  name: string;
  unreadCount: number;
  totalCount: number;
}

export interface DemoEmail {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
  };
  recipients: {
    name: string;
    email: string;
  }[];
  body: string;
  snippet: string;
  date: Date;
  attachments: Attachment[];
  unread: boolean;
  archived: boolean;
  priority: 'low' | 'medium' | 'high';
}
