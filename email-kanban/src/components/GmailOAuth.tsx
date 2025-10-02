import React, { useState } from 'react';
import { oAuth2Service } from '../services/OAuth2Service';

interface GmailOAuthProps {
  onSuccess: () => void;
}

export function GmailOAuth({ onSuccess }: GmailOAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authCode, setAuthCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleStartAuth = () => {
    try {
      const authUrl = oAuth2Service.getAuthUrl();
      setShowCodeInput(true);
      
      // Open the auth URL in the user's default browser
      if (window.require) {
        const { shell } = window.require('electron');
        shell.openExternal(authUrl);
      } else {
        // Fallback for development
        window.open(authUrl, '_blank');
      }
    } catch (err) {
      setError('Failed to start authentication process');
      console.error(err);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await oAuth2Service.exchangeCodeForTokens(authCode);
      onSuccess();
    } catch (err) {
      setError('Invalid authorization code. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Gmail</h2>
        <p className="text-gray-600">
          Sign in with your Google account to access your Gmail
        </p>
      </div>

      {!showCodeInput ? (
        <button
          onClick={handleStartAuth}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
        >
          Sign in with Google
        </button>
      ) : (
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              A browser window should have opened. After granting permission, copy the authorization code and paste it below:
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Authorization Code
            </label>
            <input
              type="text"
              value={authCode}
              onChange={e => setAuthCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste authorization code here"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !authCode.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isLoading ? 'Connecting...' : 'Complete Setup'}
          </button>

          <button
            type="button"
            onClick={() => setShowCodeInput(false)}
            className="w-full text-gray-600 hover:text-gray-800 text-sm"
          >
            Start over
          </button>
        </form>
      )}

      {error && (
        <div className="mt-4 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>
          This app will only access your Gmail messages. Your credentials are stored securely on your device.
        </p>
      </div>
    </div>
  );
}

