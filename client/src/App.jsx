import React, { useState, useEffect } from 'react';
import { Moon, Sun, Download, Heart, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CryptoChart from './components/CryptoChart';
import ReportGenerator from './components/ReportGenerator';
import { useWebSocket } from './hooks/useWebSocket';
import { useFavorites } from './hooks/useFavorites';
import { useTheme } from './hooks/useTheme';
import toast from 'react-hot-toast';

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  
  const { darkMode, toggleDarkMode } = useTheme();
  const { cryptoData, connectionStatus, priceHistory } = useWebSocket();
  const { favorites, toggleFavorite, isLoading: favoritesLoading } = useFavorites();

  const handleCryptoSelect = (crypto) => {
    setSelectedCrypto(crypto);
    setShowChart(true);
  };

  const handleFavoriteToggle = (symbol) => {
    toggleFavorite(symbol);
    const isFavorite = favorites.includes(symbol);
    toast.success(
      isFavorite ? `Removed ${symbol} from favorites` : `Added ${symbol} to favorites`,
      {
        icon: isFavorite ? '💔' : '❤️',
      }
    );
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  CryptoPulse
                </h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500 pulse-green' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500 pulse-red'
                  }`}></div>
                  <span className={`text-xs ${getConnectionStatusColor()}`}>
                    {connectionStatus === 'connected' ? 'Live' : 
                     connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowReportGenerator(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="crypto-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Coins Tracked
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(cryptoData).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="crypto-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Favorites
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {favorites.length}
                </p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="crypto-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Market Status
                </p>
                <p className="text-2xl font-bold text-green-500">
                  Live
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <Dashboard
          cryptoData={cryptoData}
          favorites={favorites}
          onCryptoSelect={handleCryptoSelect}
          onFavoriteToggle={handleFavoriteToggle}
          favoritesLoading={favoritesLoading}
        />

        {/* Chart Modal */}
        {showChart && selectedCrypto && (
          <CryptoChart
            crypto={selectedCrypto}
            priceHistory={priceHistory[selectedCrypto.symbol] || []}
            onClose={() => setShowChart(false)}
          />
        )}

        {/* Report Generator Modal */}
        {showReportGenerator && (
          <ReportGenerator
            cryptoData={cryptoData}
            favorites={favorites}
            onClose={() => setShowReportGenerator(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;