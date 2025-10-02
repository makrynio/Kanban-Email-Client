// OAuth Configuration
// Replace these with your actual Google OAuth credentials from Google Cloud Console

export const OAUTH_CONFIG = {
  // Get these from Google Cloud Console > APIs & Services > Credentials
  GOOGLE_CLIENT_ID: '153870710574-il4msv7nurdo0rkqhft1tnqcep3lsi3n.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: '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',
  
  // Redirect URI for desktop app
  REDIRECT_URI: 'urn:ietf:wg:oauth:2.0:oob',
  
  // Gmail API scopes
  SCOPES: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
  ],
  
  // Set to true to use demo mode instead of real Gmail
  USE_DEMO_MODE: false
};

// Instructions for setup:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing
// 3. Enable Gmail API (APIs & Services > Library > Gmail API > Enable)
// 4. Create OAuth credentials (APIs & Services > Credentials > Create Credentials > OAuth client ID)
// 5. Choose "Desktop application" as application type
// 6. Copy the Client ID and Client Secret here
// 7. Set USE_DEMO_MODE to false
