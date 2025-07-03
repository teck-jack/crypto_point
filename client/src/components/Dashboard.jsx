import React, { useState, useMemo } from 'react';
import { Heart, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
import CryptoCard from './CryptoCard';

const Dashboard = ({ cryptoData, favorites, onCryptoSelect, onFavoriteToggle, favoritesLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, favorites, gainers, losers
  const [sortBy, setSortBy] = useState('market_cap'); // market_cap, price, change

  const filteredAndSortedData = useMemo(() => {
    let filtered = Object.values(cryptoData);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(crypto =>
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.baseAsset?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    switch (filterType) {
      case 'favorites':
        filtered = filtered.filter(crypto => favorites.includes(crypto.symbol));
        break;
      case 'gainers':
        filtered = filtered.filter(crypto => parseFloat(crypto.priceChangePercent) > 0);
        break;
      case 'losers':
        filtered = filtered.filter(crypto => parseFloat(crypto.priceChangePercent) < 0);
        break;
      default:
        break;
    }

    // Sort data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(b.lastPrice) - parseFloat(a.lastPrice);
        case 'change':
          return parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent);
        case 'volume':
          return parseFloat(b.volume) - parseFloat(a.volume);
        default:
          return b.symbol.localeCompare(a.symbol);
      }
    });

    return filtered;
  }, [cryptoData, searchTerm, filterType, sortBy, favorites]);

  const cryptoSymbols = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
    { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
    { symbol: 'BNBUSDT', name: 'Binance Coin', icon: 'BNB' },
    { symbol: 'ADAUSDT', name: 'Cardano', icon: 'ADA' },
    { symbol: 'XRPUSDT', name: 'Ripple', icon: 'XRP' },
    { symbol: 'SOLUSDT', name: 'Solana', icon: 'SOL' },
    { symbol: 'DOTUSDT', name: 'Polkadot', icon: 'DOT' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: '🐕' },
    { symbol: 'AVAXUSDT', name: 'Avalanche', icon: 'AVAX' },
    { symbol: 'MATICUSDT', name: 'Polygon', icon: 'MATIC' },
  ];

  const getCryptoName = (symbol) => {
    const crypto = cryptoSymbols.find(c => c.symbol === symbol);
    return crypto ? crypto.name : symbol.replace('USDT', '');
  };

  const getCryptoIcon = (symbol) => {
    const crypto = cryptoSymbols.find(c => c.symbol === symbol);
    return crypto ? crypto.icon : symbol.replace('USDT', '').slice(0, 3);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Coins</option>
              <option value="favorites">Favorites</option>
              <option value="gainers">Top Gainers</option>
              <option value="losers">Top Losers</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="symbol">Name</option>
              <option value="price">Price</option>
              <option value="change">% Change</option>
              <option value="volume">Volume</option>
            </select>
          </div>
        </div>
      </div>

      {/* Crypto Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedData.map((crypto) => (
          <CryptoCard
            key={crypto.symbol}
            crypto={crypto}
            name={getCryptoName(crypto.symbol)}
            icon={getCryptoIcon(crypto.symbol)}
            isFavorite={favorites.includes(crypto.symbol)}
            onSelect={() => onCryptoSelect(crypto)}
            onFavoriteToggle={() => onFavoriteToggle(crypto.symbol)}
            favoritesLoading={favoritesLoading}
           

          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No cryptocurrencies found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;