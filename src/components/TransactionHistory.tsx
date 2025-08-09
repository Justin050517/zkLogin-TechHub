import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'contract';
  amount: string;
  token: string;
  to?: string;
  from?: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  hash: string;
  gasUsed?: string;
  contractAddress?: string;
}

interface TransactionHistoryProps {
  address: string | null;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ address }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'send' | 'receive' | 'contract'>('all');

  useEffect(() => {
    // Simulate loading transaction data
    const loadTransactions = async () => {
      setLoading(true);
      
      // Mock transaction data
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'receive',
          amount: '2.5',
          token: 'MOVE',
          from: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          status: 'confirmed',
          hash: '0x8f4b2c1d9e7a6f5c3b8d4e2a1f9c7b5d3e8a6f4c2b9d7e5a3f1c8b6d4e2a9f7c5',
          gasUsed: '21000'
        },
        {
          id: '2',
          type: 'send',
          amount: '1.0',
          token: 'MOVE',
          to: '0x8f4b2c1d9e7a6f5c3b8d4e2a1f9c7b5d3e8a6f4c',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          status: 'confirmed',
          hash: '0x2c1d9e7a6f5c3b8d4e2a1f9c7b5d3e8a6f4c2b9d7e5a3f1c8b6d4e2a9f7c5b3',
          gasUsed: '21000'
        },
        {
          id: '3',
          type: 'contract',
          amount: '0.1',
          token: 'MOVE',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
          status: 'confirmed',
          hash: '0x1d9e7a6f5c3b8d4e2a1f9c7b5d3e8a6f4c2b9d7e5a3f1c8b6d4e2a9f7c5b3d8',
          gasUsed: '45000',
          contractAddress: '0x9e7a6f5c3b8d4e2a1f9c7b5d3e8a6f4c2b9d7e5a'
        },
        {
          id: '4',
          type: 'send',
          amount: '0.5',
          token: 'MOVE',
          to: '0x7a6f5c3b8d4e2a1f9c7b5d3e8a6f4c2b9d7e5a3f',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          status: 'confirmed',
          hash: '0x6f5c3b8d4e2a1f9c7b5d3e8a6f4c2b9d7e5a3f1c8b6d4e2a9f7c5b3d8e1a4f2',
          gasUsed: '21000'
        },
        {
          id: '5',
          type: 'receive',
          amount: '5.0',
          token: 'MOVE',
          from: '0x5c3b8d4e2a1f9c7b5d3e8a6f4c2b9d7e5a3f1c8b',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          status: 'confirmed',
          hash: '0x3b8d4e2a1f9c7b5d3e8a6f4c2b9d7e5a3f1c8b6d4e2a9f7c5b3d8e1a4f2c9b7',
          gasUsed: '21000'
        },
        {
          id: '6',
          type: 'contract',
          amount: '0.2',
          token: 'MOVE',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          status: 'pending',
          hash: '0x8d4e2a1f9c7b5d3e8a6f4c2b9d7e5a3f1c8b6d4e2a9f7c5b3d8e1a4f2c9b7d5',
          gasUsed: '52000',
          contractAddress: '0x4e2a1f9c7b5d3e8a6f4c2b9d7e5a3f1c8b6d4e2a'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTransactions(mockTransactions);
      setLoading(false);
    };

    loadTransactions();
  }, [address]);

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.type === filter
  );

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return <Clock className="w-4 h-4 text-yellow-500" />;
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-red-500" />;
    
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'contract':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'send':
        return 'text-red-600';
      case 'receive':
        return 'text-green-600';
      case 'contract':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
        <div className="flex space-x-2">
          {(['all', 'send', 'receive', 'contract'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === filterType
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getTransactionIcon(tx.type, tx.status)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 capitalize">
                          {tx.type === 'contract' ? 'Smart Contract' : tx.type}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          tx.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        {tx.to && <p>To: {formatAddress(tx.to)}</p>}
                        {tx.from && <p>From: {formatAddress(tx.from)}</p>}
                        {tx.contractAddress && <p>Contract: {formatAddress(tx.contractAddress)}</p>}
                        <p>Gas: {tx.gasUsed} • {formatTime(tx.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${getAmountColor(tx.type)}`}>
                      {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.token}
                    </p>
                    <button
                      onClick={() => window.open(`https://explorer.movevm.io/tx/${tx.hash}`, '_blank')}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 mt-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
