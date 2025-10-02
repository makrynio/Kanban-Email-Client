import React, { useState } from 'react';
import { emailService, type EmailConfig } from '../services/EmailService';

interface EmailSetupProps {
  onConnect: () => void;
}

const COMMON_PROVIDERS = {
  'gmail': {
    host: 'imap.gmail.com',
    port: 993,
    tls: true
  },
  'outlook': {
    host: 'outlook.office365.com',
    port: 993,
    tls: true
  },
  'yahoo': {
    host: 'imap.mail.yahoo.com',
    port: 993,
    tls: true
  }
};

export function EmailSetup({ onConnect }: EmailSetupProps) {
  const [config, setConfig] = useState<EmailConfig>({
    user: '',
    password: '',
    host: '',
    port: 993,
    tls: true
  });
  const [provider, setProvider] = useState('custom');
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setProvider(selected);
    if (selected !== 'custom') {
      setConfig(prev => ({
        ...prev,
        ...COMMON_PROVIDERS[selected as keyof typeof COMMON_PROVIDERS]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsConnecting(true);

    try {
      await emailService.connect(config);
      onConnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Connect Email Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Provider
          </label>
          <select
            value={provider}
            onChange={handleProviderChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="custom">Custom</option>
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook</option>
            <option value="yahoo">Yahoo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={config.user}
            onChange={e => setConfig(prev => ({ ...prev, user: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={config.password}
            onChange={e => setConfig(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {provider === 'custom' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMAP Server
              </label>
              <input
                type="text"
                value={config.host}
                onChange={e => setConfig(prev => ({ ...prev, host: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Port
              </label>
              <input
                type="number"
                value={config.port}
                onChange={e => setConfig(prev => ({ ...prev, port: parseInt(e.target.value, 10) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.tls}
                onChange={e => setConfig(prev => ({ ...prev, tls: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Use TLS
              </label>
            </div>
          </>
        )}

        {error && (
          <div className="text-red-600 text-sm py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isConnecting}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isConnecting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
      </form>
    </div>
  );
}
