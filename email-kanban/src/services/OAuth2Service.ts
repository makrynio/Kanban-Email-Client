import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import Store from 'electron-store';
import { OAUTH_CONFIG } from '../config/oauth';
import { getStoreEncryptionKey } from '../config/storeKey';

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

class OAuth2Service {
  private oauth2Client: OAuth2Client;
  private store: Store;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      OAUTH_CONFIG.GOOGLE_CLIENT_ID,
      OAUTH_CONFIG.GOOGLE_CLIENT_SECRET,
      OAUTH_CONFIG.REDIRECT_URI
    );
    
    this.store = new Store({
      name: 'oauth-tokens',
      encryptionKey: getStoreEncryptionKey()
    });
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: OAUTH_CONFIG.SCOPES,
      prompt: 'consent',
      redirect_uri: OAUTH_CONFIG.REDIRECT_URI
    });
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    
    // Save tokens securely
    this.store.set('gmail_tokens', tokens);
    
    return tokens as OAuthTokens;
  }

  async getValidAccessToken(): Promise<string | null> {
    const tokens = this.store.get('gmail_tokens') as OAuthTokens | undefined;
    
    if (!tokens) {
      return null;
    }

    this.oauth2Client.setCredentials(tokens);

    try {
      // Check if token is still valid and refresh if needed
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      if (credentials.access_token !== tokens.access_token) {
        // Token was refreshed, save the new tokens
        this.store.set('gmail_tokens', credentials);
      }
      
      return credentials.access_token || null;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Clear invalid tokens
      this.store.delete('gmail_tokens');
      return null;
    }
  }

  async revokeTokens(): Promise<void> {
    const tokens = this.store.get('gmail_tokens') as OAuthTokens | undefined;
    
    if (tokens && tokens.access_token) {
      try {
        await this.oauth2Client.revokeToken(tokens.access_token);
      } catch (error) {
        console.error('Failed to revoke token:', error);
      }
    }
    
    this.store.delete('gmail_tokens');
  }

  hasValidTokens(): boolean {
    const tokens = this.store.get('gmail_tokens') as OAuthTokens | undefined;
    return !!(tokens && tokens.access_token);
  }

  getOAuth2Client(): OAuth2Client {
    const tokens = this.store.get('gmail_tokens') as OAuthTokens | undefined;
    if (tokens) {
      this.oauth2Client.setCredentials(tokens);
    }
    return this.oauth2Client;
  }
}

export const oAuth2Service = new OAuth2Service();
