import { google } from 'googleapis';
import { oAuth2Service } from './OAuth2Service';

interface GmailLabel {
  id: string;
  name: string;
  messagesTotal?: number;
  messagesUnread?: number;
  type?: string;
}

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: any;
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
}

interface ParsedEmail {
  id: string;
  subject: string;
  from: string;
  date: Date;
  snippet: string;
  isRead: boolean;
  labels: string[];
}

class GmailService {
  private gmail: any = null;

  async initialize(): Promise<void> {
    const oauth2Client = oAuth2Service.getOAuth2Client();
    
    this.gmail = google.gmail({
      version: 'v1',
      auth: oauth2Client
    });
  }

  async getLabels(): Promise<GmailLabel[]> {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    const response = await this.gmail.users.labels.list({
      userId: 'me'
    });

    return response.data.labels || [];
  }

  async getMessages(labelId: string = 'INBOX', maxResults: number = 50): Promise<ParsedEmail[]> {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    // Get list of message IDs
    const listResponse = await this.gmail.users.messages.list({
      userId: 'me',
      labelIds: [labelId],
      maxResults: maxResults
    });

    const messageIds = listResponse.data.messages || [];
    
    // Fetch detailed information for each message
    const messages: ParsedEmail[] = [];
    
    for (const messageRef of messageIds.slice(0, 20)) { // Limit to 20 for performance
      try {
        const messageResponse = await this.gmail.users.messages.get({
          userId: 'me',
          id: messageRef.id,
          format: 'full'
        });

        const message = messageResponse.data as GmailMessage;
        const parsed = this.parseMessage(message);
        if (parsed) {
          messages.push(parsed);
        }
      } catch (error) {
        console.error(`Failed to fetch message ${messageRef.id}:`, error);
      }
    }

    return messages.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private parseMessage(message: GmailMessage): ParsedEmail | null {
    try {
      const payload = message.payload;
      const headers = payload.headers || [];
      
      const getHeader = (name: string) => {
        const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : '';
      };

      const subject = getHeader('Subject') || '(No subject)';
      const from = getHeader('From') || '(Unknown sender)';
      const dateStr = getHeader('Date') || message.internalDate;
      
      // Parse date
      let date: Date;
      if (dateStr && isNaN(Number(dateStr))) {
        date = new Date(dateStr);
      } else {
        // internalDate is in milliseconds
        date = new Date(parseInt(message.internalDate));
      }

      const isRead = !message.labelIds.includes('UNREAD');

      return {
        id: message.id,
        subject,
        from,
        date,
        snippet: message.snippet || '',
        isRead,
        labels: message.labelIds
      };
    } catch (error) {
      console.error('Failed to parse message:', error);
      return null;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });
  }

  async markAsUnread(messageId: string): Promise<void> {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: ['UNREAD']
      }
    });
  }

  async markAsSpam(messageId: string): Promise<void> {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: ['SPAM'],
        removeLabelIds: ['INBOX']
      }
    });
  }

  async moveToTrash(messageId: string): Promise<void> {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    await this.gmail.users.messages.trash({
      userId: 'me',
      id: messageId
    });
  }

  async updateEmailLabels(messageId: string, addLabels: string[] = [], removeLabels: string[] = []): Promise<void> {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: addLabels,
        removeLabelIds: removeLabels
      }
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.updateEmailLabels(messageId, [], ['UNREAD']);
  }

  async markAsUnread(messageId: string): Promise<void> {
    await this.updateEmailLabels(messageId, ['UNREAD'], []);
  }

  async sendReply(originalMessageId: string, replyContent: string, replyToAll: boolean = false): Promise<void> {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    // Get the original message to extract threading information
    const originalMessage = await this.gmail.users.messages.get({
      userId: 'me',
      id: originalMessageId,
      format: 'full'
    });

    const headers = originalMessage.data.payload.headers || [];
    const getHeader = (name: string) => {
      const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    const originalSubject = getHeader('Subject') || '';
    const originalFrom = getHeader('From') || '';
    const originalTo = getHeader('To') || '';
    const originalCc = getHeader('Cc') || '';
    const messageId = getHeader('Message-ID') || '';
    const references = getHeader('References') || '';

    // Prepare reply subject
    const replySubject = originalSubject.startsWith('Re:') ? originalSubject : `Re: ${originalSubject}`;

    // Prepare recipients
    let toAddresses = originalFrom;
    let ccAddresses = '';
    
    if (replyToAll) {
      // Parse and include original To and Cc addresses, excluding our own address
      const userEmail = await this.getUserEmail();
      const allAddresses = [originalTo, originalCc].filter(Boolean).join(', ');
      const addressList = allAddresses.split(',').map(addr => addr.trim()).filter(addr => addr && !addr.includes(userEmail));
      if (addressList.length > 0) {
        ccAddresses = addressList.join(', ');
      }
    }

    // Create the email message
    const email = [
      `To: ${toAddresses}`,
      ccAddresses ? `Cc: ${ccAddresses}` : '',
      `Subject: ${replySubject}`,
      `In-Reply-To: ${messageId}`,
      `References: ${references} ${messageId}`.trim(),
      'Content-Type: text/plain; charset=utf-8',
      '',
      replyContent
    ].filter(Boolean).join('\n');

    // Encode the message
    const encodedMessage = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: originalMessage.data.threadId
      }
    });
  }

  async sendForward(originalMessageId: string, forwardTo: string, forwardContent: string): Promise<void> {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    // Get the original message
    const originalMessage = await this.gmail.users.messages.get({
      userId: 'me',
      id: originalMessageId,
      format: 'full'
    });

    const headers = originalMessage.data.payload.headers || [];
    const getHeader = (name: string) => {
      const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    const originalSubject = getHeader('Subject') || '';
    const originalFrom = getHeader('From') || '';
    const originalDate = getHeader('Date') || '';

    // Prepare forward subject
    const forwardSubject = originalSubject.startsWith('Fwd:') ? originalSubject : `Fwd: ${originalSubject}`;

    // Create the forwarded message body
    const forwardedBody = [
      forwardContent,
      '',
      '---------- Forwarded message ---------',
      `From: ${originalFrom}`,
      `Date: ${originalDate}`,
      `Subject: ${originalSubject}`,
      '',
      originalMessage.data.snippet || ''
    ].join('\n');

    // Create the email message
    const email = [
      `To: ${forwardTo}`,
      `Subject: ${forwardSubject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      forwardedBody
    ].join('\n');

    // Encode the message
    const encodedMessage = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
  }

  private async getUserEmail(): Promise<string> {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    const profile = await this.gmail.users.getProfile({
      userId: 'me'
    });

    return profile.data.emailAddress || '';
  }

  async getMessageDetails(messageId: string): Promise<any> {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    return response.data;
  }
}

export const gmailService = new GmailService();
export type { GmailLabel, ParsedEmail };

