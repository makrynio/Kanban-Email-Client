import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

export function SetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      title: "Create Google Cloud Project",
      content: "Go to Google Cloud Console and create a new project",
      link: "https://console.cloud.google.com/",
      action: "Visit Google Cloud Console"
    },
    {
      title: "Enable Gmail API",
      content: "Navigate to APIs & Services > Library, search for 'Gmail API' and enable it",
      substeps: [
        "Go to APIs & Services > Library",
        "Search for 'Gmail API'",
        "Click on Gmail API and click 'Enable'"
      ]
    },
    {
      title: "Create OAuth2 Credentials",
      content: "Create desktop application credentials",
      substeps: [
        "Go to APIs & Services > Credentials",
        "Click 'Create Credentials' > 'OAuth client ID'",
        "Choose 'Desktop application'",
        "Name it 'Email Kanban Desktop'",
        "Copy the Client ID and Client Secret"
      ]
    },
    {
      title: "Update Configuration",
      content: "Copy .env.example to .env and add your credentials",
      code: `# email-kanban/.env (git-ignored)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your-client-secret`
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gmail OAuth Setup Guide</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">📋 What you'll need:</h2>
          <ul className="text-blue-800 space-y-1">
            <li>• A Google account</li>
            <li>• Access to Google Cloud Console</li>
            <li>• About 5-10 minutes</li>
          </ul>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.content}</p>
                  
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mb-4"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {step.action}
                    </a>
                  )}
                  
                  {step.substeps && (
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                      {step.substeps.map((substep, subIndex) => (
                        <li key={subIndex}>{substep}</li>
                      ))}
                    </ol>
                  )}
                  
                  {step.code && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
                        <span className="text-sm font-medium">Configuration File</span>
                        <button
                          onClick={() => copyToClipboard(step.code, index)}
                          className="flex items-center text-gray-300 hover:text-white transition-colors"
                        >
                          {copiedStep === index ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          <span className="ml-1 text-sm">
                            {copiedStep === index ? 'Copied!' : 'Copy'}
                          </span>
                        </button>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm">
                        <code>{step.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">🎉 Final Step</h3>
          <p className="text-green-800">
            After updating the configuration file, restart the application and you'll be prompted to sign in with your Google account!
          </p>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => window.close()}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}

