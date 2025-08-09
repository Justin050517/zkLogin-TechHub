import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { validateOAuthConfig } from '../config/oauth';

interface ConfigurationStatusProps {
  className?: string;
}

export const ConfigurationStatus: React.FC<ConfigurationStatusProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(validateOAuthConfig());

  const refreshConfig = () => {
    setConfig(validateOAuthConfig());
  };

  useEffect(() => {
    // Refresh config when component mounts
    refreshConfig();
  }, []);

  const hasErrors = config.errors.length > 0;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          hasErrors 
            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
        title="Configuration Status"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">OAuth Configuration</h3>
              <button
                onClick={refreshConfig}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Refresh Configuration"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Google OAuth Status */}
              <div className="flex items-center gap-3">
                {config.google ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                <span className="text-sm font-medium">Google OAuth</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  config.google 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {config.google ? 'Configured' : 'Not Configured'}
                </span>
              </div>

              {/* Facebook OAuth Status */}
              <div className="flex items-center gap-3">
                {config.facebook ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium">Facebook OAuth</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  config.facebook 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {config.facebook ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>

            {/* Error Messages */}
            {config.errors.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Configuration Issues:</h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {config.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Google OAuth Access Issue */}
            {config.google && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Getting "Access Denied" Error?
                </h4>
                <p className="text-xs text-blue-700 mb-2">
                  Check your Google Cloud Console configuration:
                </p>
                <ul className="text-xs text-blue-700 space-y-1 mb-3">
                  <li>• OAuth consent screen is configured</li>
                  <li>• You're added as a test user</li>
                  <li>• Authorized origins are set correctly</li>
                  <li>• Required APIs are enabled</li>
                </ul>
                <a 
                  href="/GOOGLE_OAUTH_ACCESS_TROUBLESHOOTING.md" 
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Troubleshooting Guide
                </a>
              </div>
            )}

            {/* Help Links */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex gap-2">
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Google Console
                </a>
                <a 
                  href="/GOOGLE_OAUTH_ACCESS_TROUBLESHOOTING.md" 
                  target="_blank"
                  className="flex-1 text-center px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Help Guide
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
