import React, { createContext, useContext, useState, useEffect } from 'react';
import { oAuth2Service } from '../services/OAuth2Service';
import { gmailService } from '../services/GmailService';
import { OAUTH_CONFIG } from '../config/oauth';

interface GmailAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticateUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const GmailAuthContext = createContext<GmailAuthContextType | undefined>(undefined);

export const useGmailAuth = () => {
  const context = useContext(GmailAuthContext);
  if (!context) {
    throw new Error('useGmailAuth must be used within a GmailAuthProvider');
  }
  return context;
};

interface GmailAuthProviderProps {
  children: React.ReactNode;
}

export const GmailAuthProvider: React.FC<GmailAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (OAUTH_CONFIG.USE_DEMO_MODE) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const hasValidTokens = oAuth2Service.hasValidTokens();
      if (hasValidTokens) {
        const accessToken = await oAuth2Service.getValidAccessToken();
        if (accessToken) {
          await gmailService.initialize();
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateUser = async () => {
    try {
      setIsLoading(true);
      
      if (OAUTH_CONFIG.USE_DEMO_MODE) {
        throw new Error('Demo mode is enabled because no Google credentials are configured. Copy .env.example to .env and set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_SECRET.');
      }

      // Get auth URL and open it
      const authUrl = oAuth2Service.getAuthUrl();
      
      // In Electron, open the URL in the system browser
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        (window as any).electronAPI.openExternal(authUrl);
      } else {
        window.open(authUrl, '_blank');
      }

      // Prompt user for the authorization code
      const authCode = prompt(
        'Please complete the authorization in your browser and paste the authorization code here:'
      );

      if (!authCode) {
        throw new Error('Authorization code required');
      }

      // Exchange code for tokens
      await oAuth2Service.exchangeCodeForTokens(authCode);
      
      // Initialize Gmail service
      await gmailService.initialize();
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication failed:', error);
      alert(`Authentication failed: ${error.message}`);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await oAuth2Service.revokeTokens();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    authenticateUser,
    signOut,
  };

  return <GmailAuthContext.Provider value={value}>{children}</GmailAuthContext.Provider>;
};
