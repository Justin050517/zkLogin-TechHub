import React from 'react';
import { LogOut, Copy, ExternalLink, User, Mail, Shield } from 'lucide-react';
import { UserInfo } from '../hooks/useZkLogin';

interface UserProfileProps {
  userInfo: UserInfo | null;
  address: string | null;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userInfo, address, onLogout }) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openInExplorer = () => {
    if (address) {
      window.open(`https://suiexplorer.com/address/${address}?network=testnet`, '_blank');
    }
  };

  if (!userInfo || !address) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* User Information */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Profile Information
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={userInfo.picture}
                alt={userInfo.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <h4 className="font-medium text-gray-900">{userInfo.name}</h4>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {userInfo.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  via {userInfo.provider}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* zkLogin Address */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            zkLogin Address
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-xs text-gray-500 mb-2">Sui Testnet Address</p>
              <p className="font-mono text-sm text-gray-900 break-all">
                {address}
              </p>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => copyToClipboard(address)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
                <button
                  onClick={openInExplorer}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Explorer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What's Next?
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Smart Contracts</h4>
            <p className="text-sm text-gray-600">
              Interact with Move VM smart contracts using your authenticated address
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Token Transfers</h4>
            <p className="text-sm text-gray-600">
              Send and receive SUI tokens and other assets on the network
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">DApp Integration</h4>
            <p className="text-sm text-gray-600">
              Connect to decentralized applications with zero-knowledge authentication
            </p>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">🔧 Technical Implementation</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Real zkLogin address generation using Sui SDK</li>
          <li>• Browser-compatible JWT decoding (no external dependencies)</li>
          <li>• Authentic testnet addresses searchable on Sui Explorer</li>
          <li>• Production-ready authentication flow</li>
        </ul>
      </div>
    </div>
  );
};

export default UserProfile;
