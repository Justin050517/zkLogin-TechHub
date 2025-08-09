import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, ExternalLink, Users, DollarSign, Zap, Shield, Gamepad2, Coins } from 'lucide-react';

interface DApp {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  rating: number;
  users: string;
  tvl?: string;
  url: string;
  featured: boolean;
}

const DAppExplorer: React.FC = () => {
  const [dapps, setDapps] = useState<DApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All', icon: TrendingUp },
    { id: 'defi', name: 'DeFi', icon: DollarSign },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2 },
    { id: 'nft', name: 'NFT', icon: Star },
    { id: 'dao', name: 'DAO', icon: Users },
    { id: 'infrastructure', name: 'Infrastructure', icon: Zap },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  useEffect(() => {
    const loadDApps = async () => {
      setLoading(true);
      
      // Mock dApp data
      const mockDApps: DApp[] = [
        {
          id: '1',
          name: 'MoveSwap',
          description: 'Decentralized exchange for trading Move VM tokens with zero-knowledge privacy',
          category: 'defi',
          logo: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=64&h=64&fit=crop&crop=center',
          rating: 4.8,
          users: '125K',
          tvl: '$45.2M',
          url: 'https://moveswap.io',
          featured: true
        },
        {
          id: '2',
          name: 'ZkLend',
          description: 'Privacy-preserving lending and borrowing protocol built on Move VM',
          category: 'defi',
          logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop&crop=center',
          rating: 4.6,
          users: '89K',
          tvl: '$28.7M',
          url: 'https://zklend.io',
          featured: true
        },
        {
          id: '3',
          name: 'MoveQuest',
          description: 'Play-to-earn RPG game with NFT characters and zero-knowledge battles',
          category: 'gaming',
          logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=64&h=64&fit=crop&crop=center',
          rating: 4.7,
          users: '67K',
          url: 'https://movequest.game',
          featured: false
        },
        {
          id: '4',
          name: 'PrivateNFT',
          description: 'Create and trade NFTs with privacy-preserving metadata using ZK proofs',
          category: 'nft',
          logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop&crop=center',
          rating: 4.5,
          users: '43K',
          url: 'https://privatenft.io',
          featured: false
        },
        {
          id: '5',
          name: 'MoveDAO',
          description: 'Decentralized governance platform for Move VM ecosystem projects',
          category: 'dao',
          logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=64&h=64&fit=crop&crop=center',
          rating: 4.4,
          users: '32K',
          url: 'https://movedao.org',
          featured: false
        },
        {
          id: '6',
          name: 'ZkBridge',
          description: 'Cross-chain bridge with zero-knowledge proofs for secure asset transfers',
          category: 'infrastructure',
          logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=64&h=64&fit=crop&crop=center',
          rating: 4.9,
          users: '156K',
          url: 'https://zkbridge.io',
          featured: true
        },
        {
          id: '7',
          name: 'SecureVault',
          description: 'Multi-signature wallet with advanced security features for Move VM',
          category: 'security',
          logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=64&h=64&fit=crop&crop=center',
          rating: 4.8,
          users: '78K',
          url: 'https://securevault.io',
          featured: false
        },
        {
          id: '8',
          name: 'MoveStake',
          description: 'Liquid staking protocol with automated yield optimization strategies',
          category: 'defi',
          logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=64&h=64&fit=crop&crop=center',
          rating: 4.6,
          users: '94K',
          tvl: '$18.9M',
          url: 'https://movestake.io',
          featured: false
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDapps(mockDApps);
      setLoading(false);
    };

    loadDApps();
  }, []);

  const filteredDApps = dapps.filter(dapp => 
    selectedCategory === 'all' || dapp.category === selectedCategory
  );

  const featuredDApps = dapps.filter(dapp => dapp.featured);

  const formatUsers = (users: string) => {
    return users;
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : TrendingUp;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Explore dApps</h2>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4 h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Explore dApps</h2>
        <div className="text-sm text-gray-500">
          {filteredDApps.length} applications
        </div>
      </div>

      {/* Featured dApps */}
      {selectedCategory === 'all' && featuredDApps.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Featured dApps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredDApps.map((dapp) => {
              const IconComponent = getCategoryIcon(dapp.category);
              return (
                <div key={dapp.id} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={dapp.logo}
                        alt={dapp.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{dapp.name}</h4>
                        <div className="flex items-center space-x-1">
                          <IconComponent className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-500 capitalize">{dapp.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{dapp.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dapp.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{formatUsers(dapp.users)}</span>
                      </div>
                      {dapp.tvl && (
                        <div className="flex items-center space-x-1">
                          <Coins className="w-4 h-4" />
                          <span>{dapp.tvl}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => window.open(dapp.url, '_blank')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Launch App</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* All dApps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDApps.map((dapp) => {
          const IconComponent = getCategoryIcon(dapp.category);
          return (
            <div key={dapp.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={dapp.logo}
                    alt={dapp.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{dapp.name}</h4>
                    <div className="flex items-center space-x-1">
                      <IconComponent className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500 capitalize">{dapp.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{dapp.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{dapp.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{formatUsers(dapp.users)}</span>
                  </div>
                  {dapp.tvl && (
                    <div className="flex items-center space-x-1">
                      <Coins className="w-4 h-4" />
                      <span>{dapp.tvl}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => window.open(dapp.url, '_blank')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>Launch App</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {filteredDApps.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No dApps found</h3>
          <p className="text-gray-500">Try selecting a different category</p>
        </div>
      )}
    </div>
  );
};

export default DAppExplorer;
