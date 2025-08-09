import React, { useState, useEffect } from 'react';
import { User, Shield, Clock, Activity, ExternalLink, Database } from 'lucide-react';
import { AuthState } from '../types/auth';
import { getUserProfile, getAuthEvents, PACKAGE_ID } from '../utils/suiClient';
import { DeploymentStatus } from './DeploymentStatus';

interface DashboardProps {
  authState: AuthState;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ authState, onLogout }) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authEvents, setAuthEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [authState.zkLoginAddress]);

  const loadDashboardData = async () => {
    if (!authState.zkLoginAddress) return;

    try {
      setLoading(true);
      
      // Load user profile from blockchain
      const profile = await getUserProfile('', authState.zkLoginAddress);
      setUserProfile(profile);

      // Load authentication events
      const events = await getAuthEvents(PACKAGE_ID, 'UserLoggedIn');
      setAuthEvents(events);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRealContract = PACKAGE_ID !== '0x0';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {userProfile?.name || 'User'}!
                </h1>
                <p className="text-gray-600">
                  Authenticated via {authState.provider} using zkLogin
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Smart Contract Status */}
            <DeploymentStatus />

            {/* User Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {isRealContract && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    On-Chain
                  </span>
                )}
              </div>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-900">{userProfile?.email || authState.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider
                    </label>
                    <p className="text-gray-900 capitalize">{userProfile?.provider || authState.provider}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      zkLogin Address
                    </label>
                    <p className="text-gray-900 font-mono text-sm break-all">
                      {authState.zkLoginAddress}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Login Count
                    </label>
                    <p className="text-gray-900">{userProfile?.loginCount || 1} times</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <p className="text-gray-900">
                      {userProfile?.createdAt 
                        ? formatDate(userProfile.createdAt)
                        : formatDate(Date.now())
                      }
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Login
                    </label>
                    <p className="text-gray-900">
                      {userProfile?.lastLogin 
                        ? formatDate(userProfile.lastLogin)
                        : 'Just now'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Authentication Events */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                {isRealContract && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    Blockchain Events
                  </span>
                )}
              </div>

              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : authEvents.length > 0 ? (
                <div className="space-y-3">
                  {authEvents.slice(0, 5).map((event, index) => (
                    <div key={event.id || index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          User authenticated via {event.data?.provider || 'OAuth'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(event.timestamp)}
                        </p>
                      </div>
                      {event.transactionDigest && (
                        <a
                          href={`https://suiexplorer.com/txblock/${event.transactionDigest}?network=testnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity found</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Logins</span>
                  <span className="font-semibold">{userProfile?.loginCount || 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userProfile?.isActive !== false 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {userProfile?.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Contract Type</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isRealContract 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {isRealContract ? 'Real' : 'Mock'}
                  </span>
                </div>
              </div>
            </div>

            {/* zkLogin Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">zkLogin Details</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Network:</span>
                  <span className="ml-2 font-medium">Sui Testnet</span>
                </div>
                <div>
                  <span className="text-gray-600">Proof Type:</span>
                  <span className="ml-2 font-medium">Zero-Knowledge</span>
                </div>
                <div>
                  <span className="text-gray-600">Key Type:</span>
                  <span className="ml-2 font-medium">Ephemeral</span>
                </div>
                {authState.nonce && (
                  <div>
                    <span className="text-gray-600">Session Nonce:</span>
                    <span className="ml-2 font-mono text-xs break-all">
                      {authState.nonce.substring(0, 16)}...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Help & Resources */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
              <div className="space-y-3">
                <a
                  href="https://docs.sui.io/concepts/cryptography/zklogin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  zkLogin Documentation
                </a>
                <a
                  href="https://docs.sui.io/concepts/sui-move-concepts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  Move Language Guide
                </a>
                <a
                  href="https://suiexplorer.com/?network=testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  Sui Explorer
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
