import React from 'react';
import { Heart, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const CryptoCard = ({ 
  crypto, 
  name, 
  icon, 
  isFavorite, 
  onSelect, 
  onFavoriteToggle, 
  favoritesLoading 
}) => {
  const priceChange = parseFloat(crypto.priceChangePercent || 0);
  const isPositive = priceChange >= 0;
  const price = parseFloat(crypto.lastPrice || 0);
  const volume = parseFloat(crypto.volume || 0);

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatVolume = (volume) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  return (
    <div className="crypto-card p-6 cursor-pointer relative group">
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle();
        }}
        disabled={favoritesLoading}
        className={`absolute top-4 right-4 p-1 rounded-full transition-all duration-200 ${
          isFavorite 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-400 hover:text-red-500'
        }`}
      >
        <Heart 
          className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
        />
      </button>

      <div onClick={onSelect} className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {crypto.symbol?.replace('USDT', '')}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(price)}
            </span>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
              isPositive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(priceChange).toFixed(2)}%</span>
            </div>
          </div>

          {/* 24h Change */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            24h Change: <span className={isPositive ? 'price-positive' : 'price-negative'}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">24h Volume:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatVolume(volume)}
            </span>
          </div>
        </div>

        {/* Chart Button */}
        <div className="pt-2">
          <div className="flex items-center justify-center w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 group-hover:bg-blue-100 dark:group-hover:bg-blue-800">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              View Chart
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoCard;