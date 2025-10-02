import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { EmailViewer } from './components/EmailViewer';
import { GmailOAuth } from './components/GmailOAuth';
import { FolderList } from './components/FolderList';
import { EmailList } from './components/EmailList';
import { OAuth2Service } from './services/OAuth2Service';
import { GmailService } from './services/GmailService';
import { demoEmailService } from './services/DemoEmailService';
import { OAUTH_CONFIG } from './config/oauth';
import { ParsedEmail, DemoEmail, GmailLabel, DemoLabel } from './types';

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<(GmailLabel | DemoLabel)[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [messages, setMessages] = useState<(ParsedEmail | DemoEmail)[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<(ParsedEmail | DemoEmail) | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const oAuth2Service = new OAuth2Service();
  const gmailService = new GmailService();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      if (OAUTH_CONFIG.USE_DEMO_MODE) {
        // Use demo mode
        setConnectionStatus('connected');
        await loadDemoData();
      } else {
        // Check if we have valid OAuth tokens
        if (oAuth2Service.hasValidTokens()) {
          setConnectionStatus('connecting');
          await connectToGmail();
        }
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setError('Failed to initialize app');
    }
  };

  const loadDemoData = async () => {
    try {
      setLoading(true);
      const demoFolders = await demoEmailService.getLabels();
      setFolders(demoFolders);
      
      if (demoFolders.length > 0) {
        setSelectedFolder(demoFolders[0].id);
        const demoMessages = await demoEmailService.getMessages(demoFolders[0].id);
        setMessages(demoMessages);
      }
    } catch (error) {
      console.error('Error loading demo data:', error);
      setError('Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  const connectToGmail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const accessToken = await oAuth2Service.getValidAccessToken();
      if (!accessToken) {
        throw new Error('Failed to get valid access token');
      }

      await gmailService.initialize(oAuth2Service.getOAuth2Client());
      
      // Load Gmail data
      const gmailFolders = await gmailService.getLabels();
      setFolders(gmailFolders);
      
      if (gmailFolders.length > 0) {
        const inbox = gmailFolders.find(f => f.id === 'INBOX') || gmailFolders[0];
        setSelectedFolder(inbox.id);
        const gmailMessages = await gmailService.getMessages(inbox.id);
        setMessages(gmailMessages);
      }

      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error connecting to Gmail:', error);
      setError('Failed to connect to Gmail');
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnectionStatus('connecting');
    await connectToGmail();
  };

  const handleDisconnect = () => {
    oAuth2Service.revokeTokens();
    setConnectionStatus('disconnected');
    setFolders([]);
    setMessages([]);
    setSelectedEmail(null);
    setSelectedFolder(null);
  };

  const handleFolderSelect = async (folderId: string) => {
    try {
      setLoading(true);
      setSelectedFolder(folderId);
      setSelectedEmail(null);

      if (OAUTH_CONFIG.USE_DEMO_MODE) {
        const demoMessages = await demoEmailService.getMessages(folderId);
        setMessages(demoMessages);
      } else {
        const gmailMessages = await gmailService.getMessages(folderId);
        setMessages(gmailMessages);
      }
    } catch (error) {
      console.error('Error loading messages for folder:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSelect = (email: ParsedEmail | DemoEmail) => {
    setSelectedEmail(email);
    
    // Mark as read if it's unread
    if ('unread' in email && email.unread && !OAUTH_CONFIG.USE_DEMO_MODE) {
      gmailService.markAsRead(email.id).catch(console.error);
    }
  };

  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'kanban' ? 'list' : 'kanban');
  };

  if (connectionStatus === 'disconnected' && !OAUTH_CONFIG.USE_DEMO_MODE) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Kanban</h1>
          <GmailOAuth 
            onConnect={handleConnect}
            oAuth2Service={oAuth2Service}
            gmailService={gmailService}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Email Kanban</h2>
            <button
              onClick={handleViewModeToggle}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
            </button>
          </div>

          {!OAUTH_CONFIG.USE_DEMO_MODE && (
            <button
              onClick={handleDisconnect}
              className="w-full mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Disconnect Gmail
            </button>
          )}

          <FolderList
            folders={folders}
            selectedFolder={selectedFolder}
            onFolderSelect={handleFolderSelect}
            loading={loading}
          />
        </div>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {viewMode === 'kanban' ? (
          <KanbanBoard
            emails={messages}
            onEmailSelect={handleEmailSelect}
            selectedEmail={selectedEmail}
          />
        ) : (
          <div className="flex-1 flex">
            <div className="flex-1 border-r border-gray-200">
              <EmailList
                emails={messages}
                selectedEmail={selectedEmail}
                onEmailSelect={handleEmailSelect}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Email Viewer */}
        {selectedEmail && (
          <div className="w-1/3 border-l border-gray-200">
            <EmailViewer email={selectedEmail} />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-white hover:text-red-200"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
