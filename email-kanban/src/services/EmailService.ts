import Imap from 'node-imap';
import Store from 'electron-store';
import { simpleParser } from 'mailparser';
import { getStoreEncryptionKey } from '../config/storeKey';

interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  /** Accept self-signed or otherwise invalid TLS certificates. Off by default; only enable for servers you trust. */
  allowSelfSignedCerts?: boolean;
}

interface EmailFolder {
  name: string;
  path: string;
  unreadCount?: number;
}

interface EmailMessage {
  uid: number;
  subject: string;
  from: string;
  date: Date;
  snippet: string;
  isRead: boolean;
}

class EmailService {
  private imap: Imap | null = null;
  private store: Store;

  constructor() {
    this.store = new Store({
      name: 'email-config',
      encryptionKey: getStoreEncryptionKey()
    });
  }

  async connect(config: EmailConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap = new Imap({
        user: config.user,
        password: config.password,
        host: config.host,
        port: config.port,
        tls: config.tls,
        tlsOptions: { rejectUnauthorized: !config.allowSelfSignedCerts }
      });

      this.imap.once('ready', () => {
        console.log('Connected to IMAP server');
        this.store.set('emailConfig', config);
        resolve();
      });

      this.imap.once('error', (err: Error) => {
        console.error('IMAP connection error:', err);
        reject(err);
      });

      this.imap.connect();
    });
  }

  async getFolders(): Promise<EmailFolder[]> {
    if (!this.imap) throw new Error('Not connected to email server');

    return new Promise((resolve, reject) => {
      this.imap!.getBoxes((err, boxes) => {
        if (err) {
          reject(err);
          return;
        }

        const folders: EmailFolder[] = [];
        const processBoxes = (boxes: Imap.MailBoxes, prefix = '') => {
          Object.keys(boxes).forEach(key => {
            const path = prefix + key;
            folders.push({
              name: key,
              path: path,
            });
            if (boxes[key].children) {
              processBoxes(boxes[key].children!, path + boxes[key].delimiter);
            }
          });
        };

        processBoxes(boxes);
        resolve(folders);
      });
    });
  }

  async getMessages(folderPath: string, limit = 50): Promise<EmailMessage[]> {
    if (!this.imap) throw new Error('Not connected to email server');

    return new Promise((resolve, reject) => {
      this.imap!.openBox(folderPath, false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        const messages: EmailMessage[] = [];
        this.imap!.search(['ALL'], (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          const fetch = this.imap!.fetch(results.slice(-limit), {
            bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT'],
            struct: true
          });

          fetch.on('message', (msg) => {
            const message: Partial<EmailMessage> = {};

            msg.on('body', (stream, info) => {
              let buffer = '';
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });

              stream.once('end', () => {
                if (info.which === 'TEXT') {
                  message.snippet = buffer.substring(0, 100).trim();
                } else {
                  const header = Imap.parseHeader(buffer);
                  message.subject = header.subject?.[0] || '(No subject)';
                  message.from = header.from?.[0] || '(Unknown sender)';
                  message.date = new Date(header.date?.[0] || Date.now());
                }
              });
            });

            msg.once('attributes', (attrs) => {
              message.uid = attrs.uid;
              message.isRead = (attrs.flags || []).includes('\\Seen');
            });

            msg.once('end', () => {
              messages.push(message as EmailMessage);
            });
          });

          fetch.once('error', (err) => {
            reject(err);
          });

          fetch.once('end', () => {
            resolve(messages.sort((a, b) => b.date.getTime() - a.date.getTime()));
          });
        });
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.imap && this.imap.state !== 'disconnected') {
        this.imap.once('end', () => {
          this.imap = null;
          resolve();
        });
        this.imap.end();
      } else {
        resolve();
      }
    });
  }

  getSavedConfig(): EmailConfig | null {
    return this.store.get('emailConfig') as EmailConfig | null;
  }
}

export const emailService = new EmailService();
export type { EmailConfig, EmailFolder, EmailMessage };
