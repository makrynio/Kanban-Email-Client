import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ParsedEmail, GmailLabel } from '../types';

export class GmailService {
  private gmail: any;

  async initialize(auth: OAuth2Client) {
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async getLabels(): Promise<GmailLabel[]> {
    try {
      const response = await this.gmail.users.labels.list({
        userId: 'me',
      });

      return response.data.labels || [];
    } catch (error) {
      console.error('Error fetching labels:', error);
      throw error;
    }
  }

  async getMessages(labelId?: string, maxResults: number = 50): Promise<ParsedEmail[]> {
    try {
      const query = labelId ? `label:${labelId}` : '';
      
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      const messages = response.data.messages || [];
      const parsedEmails: ParsedEmail[] = [];

      for (const message of messages) {
        try {
          const email = await this.parseMessage(message.id);
          if (email) {
            parsedEmails.push(email);
          }
        } catch (error) {
          console.error(`Error parsing message ${message.id}:`, error);
        }
      }

      return parsedEmails;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  private async parseMessage(messageId: string): Promise<ParsedEmail | null> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const message = response.data;
      const headers = message.payload?.headers || [];
      
      const getHeader = (name: string) => {
        const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return header?.value || '';
      };

      const subject = getHeader('subject');
      const from = getHeader('from');
      const to = getHeader('to');
      const date = getHeader('date');
      const messageIdHeader = getHeader('message-id');

      // Parse sender and recipients
      const sender = this.parseEmailAddress(from);
      const recipients = this.parseEmailAddresses(to);

      // Get body content
      const body = this.extractBody(message.payload);
      const snippet = message.snippet || '';

      // Check if email is unread
      const unread = !message.labelIds?.includes('UNREAD') ? false : true;

      // Check if email is archived (in trash or spam)
      const archived = message.labelIds?.includes('TRASH') || message.labelIds?.includes('SPAM') || false;

      // Determine priority based on headers and labels
      const priority = this.determinePriority(message.labelIds, headers);

      // Extract attachments
      const attachments = this.extractAttachments(message.payload);

      return {
        id: messageId,
        threadId: message.threadId || '',
        subject: subject || '(No Subject)',
        sender,
        recipients,
        body,
        snippet,
        date: new Date(date || Date.now()),
        attachments,
        unread,
        archived,
        priority
      };
    } catch (error) {
      console.error(`Error parsing message ${messageId}:`, error);
      return null;
    }
  }

  private parseEmailAddress(emailString: string) {
    // Extract name and email from "Name <email@domain.com>" format
    const match = emailString.match(/^"?([^"<]+)"?\s*<?([^>]+)>?$/);
    if (match) {
      return {
        name: match[1].trim(),
        email: match[2].trim()
      };
    }
    return {
      name: '',
      email: emailString.trim()
    };
  }

  private parseEmailAddresses(emailString: string) {
    if (!emailString) return [];
    
    // Split multiple email addresses and parse each one
    return emailString.split(',').map(email => this.parseEmailAddress(email.trim()));
  }

  private extractBody(payload: any): string {
    if (!payload) return '';

    // Handle multipart messages
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain') {
          return this.decodeBody(part.body.data);
        }
      }
      // Fallback to first part if no plain text
      if (payload.parts[0]?.body?.data) {
        return this.decodeBody(payload.parts[0].body.data);
      }
    }

    // Handle single part messages
    if (payload.body?.data) {
      return this.decodeBody(payload.body.data);
    }

    return '';
  }

  private decodeBody(data: string): string {
    try {
      return Buffer.from(data, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Error decoding body:', error);
      return '';
    }
  }

  private extractAttachments(payload: any): any[] {
    const attachments: any[] = [];

    const extractFromPart = (part: any) => {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          id: part.body.attachmentId,
          name: part.filename,
          size: part.body.size || 0,
          type: part.mimeType || 'application/octet-stream'
        });
      }

      if (part.parts) {
        part.parts.forEach(extractFromPart);
      }
    };

    if (payload.parts) {
      payload.parts.forEach(extractFromPart);
    } else if (payload.filename && payload.body?.attachmentId) {
      attachments.push({
        id: payload.body.attachmentId,
        name: payload.filename,
        size: payload.body.size || 0,
        type: payload.mimeType || 'application/octet-stream'
      });
    }

    return attachments;
  }

  private determinePriority(labelIds: string[] = [], headers: any[] = []): 'low' | 'medium' | 'high' {
    // Check for priority headers
    const priorityHeader = headers.find(h => h.name.toLowerCase() === 'x-priority')?.value;
    const importanceHeader = headers.find(h => h.name.toLowerCase() === 'importance')?.value;

    if (priorityHeader === '1' || importanceHeader === 'high') {
      return 'high';
    }

    if (priorityHeader === '3' || importanceHeader === 'low') {
      return 'low';
    }

    // Check for important labels
    if (labelIds.includes('IMPORTANT') || labelIds.includes('STARRED')) {
      return 'high';
    }

    // Default to medium
    return 'medium';
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async markAsUnread(messageId: string): Promise<void> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: ['UNREAD']
        }
      });
    } catch (error) {
      console.error('Error marking message as unread:', error);
      throw error;
    }
  }
}
