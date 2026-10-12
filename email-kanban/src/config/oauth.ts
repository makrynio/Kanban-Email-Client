// OAuth configuration.
// Credentials are read from environment variables (see .env.example), never committed.
// Create a Desktop-app OAuth client in Google Cloud Console and put the values in a local .env file.

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string | undefined;

export const OAUTH_CONFIG = {
  GOOGLE_CLIENT_ID: clientId ?? '',
  GOOGLE_CLIENT_SECRET: clientSecret ?? '',

  // Redirect URI for desktop app
  REDIRECT_URI: 'urn:ietf:wg:oauth:2.0:oob',

  // Gmail API scopes
  SCOPES: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
  ],

  // Demo mode is used automatically when no Google credentials are configured
  USE_DEMO_MODE: !clientId || !clientSecret
};
