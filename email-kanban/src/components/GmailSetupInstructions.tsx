import React from 'react';
import { ExternalLink, Key, Settings } from 'lucide-react';

const GmailSetupInstructions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gmail Integration Setup</h1>
        <p className="text-gray-600">Follow these steps to connect your Gmail account</p>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Step 1: Create Google Cloud Project
          </h2>
          <ol className="space-y-3 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              <div>
                Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 inline-flex items-center gap-1">
                  Google Cloud Console <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              <span>Create a new project or select an existing one</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
              <span>Enable the Gmail API (APIs & Services → Library → Gmail API → Enable)</span>
            </li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Step 2: Create OAuth Credentials
          </h2>
          <ol className="space-y-3 text-green-800">
            <li className="flex items-start gap-2">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              <span>Go to APIs & Services → Credentials</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              <span>Click "Create Credentials" → "OAuth client ID"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
              <span>Choose "Desktop application" as application type</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
              <span>Copy the Client ID and Client Secret</span>
            </li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-amber-900 mb-4">Step 3: Update Configuration</h2>
          <div className="text-amber-800 space-y-3">
            <p>Replace the placeholder credentials in <code className="bg-amber-100 px-2 py-1 rounded">src/config/oauth.ts</code> with your actual values:</p>
            <div className="bg-white border border-amber-300 rounded p-4 font-mono text-sm">
              <div className="text-gray-600">// Replace these with your actual credentials:</div>
              <div>GOOGLE_CLIENT_ID: 'your-client-id.apps.googleusercontent.com'</div>
              <div>GOOGLE_CLIENT_SECRET: 'your-client-secret'</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Configuration Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Client ID:</span>
              <div className="text-gray-600 font-mono break-all">153870710574-il4msv7nurdo0rkqhft1tnqcep3lsi3n.apps.googleusercontent.com</div>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Demo Credentials</span>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            ⚠️ The current credentials are for demo purposes only. Replace them with your own to connect to your Gmail account.
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh App After Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default GmailSetupInstructions;
