import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { PACKAGE_ID, REGISTRY_OBJECT_ID, testSuiConnection, findAuthRegistry } from '../utils/suiClient';

interface DeploymentStatusProps {
  className?: string;
}

export const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ className = '' }) => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [registryStatus, setRegistryStatus] = useState<'checking' | 'found' | 'not-found'>('checking');
  const [autoFoundRegistry, setAutoFoundRegistry] = useState<string | null>(null);

  useEffect(() => {
    checkDeploymentStatus();
  }, []);

  const checkDeploymentStatus = async () => {
    // Test Sui connection
    const isConnected = await testSuiConnection();
    setConnectionStatus(isConnected ? 'connected' : 'failed');

    // Check registry status
    if (PACKAGE_ID !== '0x0') {
      if (REGISTRY_OBJECT_ID) {
        setRegistryStatus('found');
      } else {
        // Try to auto-find registry
        const foundRegistry = await findAuthRegistry();
        if (foundRegistry) {
          setAutoFoundRegistry(foundRegistry);
          setRegistryStatus('found');
        } else {
          setRegistryStatus('not-found');
        }
      }
    } else {
      setRegistryStatus('not-found');
    }
  };

  const isContractDeployed = PACKAGE_ID !== '0x0';
  const isFullyConfigured = isContractDeployed && (REGISTRY_OBJECT_ID || autoFoundRegistry);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Contract Status</h3>
      
      <div className="space-y-3">
        {/* Sui Network Connection */}
        <div className="flex items-center gap-3">
          {connectionStatus === 'checking' && (
            <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
          )}
          {connectionStatus === 'connected' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {connectionStatus === 'failed' && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm font-medium">
            Sui Network Connection
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-700' 
              : connectionStatus === 'failed'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {connectionStatus === 'checking' ? 'Checking...' : 
             connectionStatus === 'connected' ? 'Connected' : 'Failed'}
          </span>
        </div>

        {/* Package Deployment */}
        <div className="flex items-center gap-3">
          {isContractDeployed ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          )}
          <span className="text-sm font-medium">
            Move Contract Package
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            isContractDeployed 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {isContractDeployed ? 'Deployed' : 'Not Deployed'}
          </span>
        </div>

        {/* Registry Object */}
        <div className="flex items-center gap-3">
          {registryStatus === 'checking' && (
            <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
          )}
          {registryStatus === 'found' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {registryStatus === 'not-found' && (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          )}
          <span className="text-sm font-medium">
            AuthRegistry Object
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            registryStatus === 'found' 
              ? 'bg-green-100 text-green-700' 
              : registryStatus === 'not-found'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {registryStatus === 'checking' ? 'Checking...' : 
             registryStatus === 'found' ? 'Found' : 'Not Found'}
          </span>
        </div>
      </div>

      {/* Status Details */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm space-y-2">
          {isFullyConfigured ? (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Ready for real blockchain integration!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Using mock implementation</span>
            </div>
          )}
          
          {PACKAGE_ID !== '0x0' && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Package ID:</span> {PACKAGE_ID}
            </div>
          )}
          
          {(REGISTRY_OBJECT_ID || autoFoundRegistry) && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Registry ID:</span> {REGISTRY_OBJECT_ID || autoFoundRegistry}
              {autoFoundRegistry && !REGISTRY_OBJECT_ID && (
                <span className="text-yellow-600 ml-1">(auto-detected)</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Links */}
      {!isContractDeployed && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            Ready to deploy your Move contract? Follow the deployment guide:
          </p>
          <a 
            href="/DEPLOYMENT_GUIDE.md" 
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-4 h-4" />
            View Deployment Guide
          </a>
        </div>
      )}

      {isContractDeployed && PACKAGE_ID !== '0x0' && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800 mb-2">
            View your contract on Sui Explorer:
          </p>
          <a 
            href={`https://suiexplorer.com/object/${PACKAGE_ID}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Sui Explorer
          </a>
        </div>
      )}
    </div>
  );
};
