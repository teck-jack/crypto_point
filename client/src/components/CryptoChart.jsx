import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Activity, Clock, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const CryptoChart = ({ crypto, priceHistory, onClose }) => {
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateRealistic24hData = () => {
      setIsLoading(true);
      const data = [];
      const currentPrice = parseFloat(crypto.lastPrice);
      const priceChange24h = parseFloat(crypto.priceChangePercent) / 100;
      const startPrice = currentPrice / (1 + priceChange24h);
      
      const now = new Date();
      let hoursToShow, intervalMinutes, totalPoints;
      
      // Define proper intervals for each timeframe
      switch (timeframe) {
        case '1h':
          hoursToShow = 1;
          intervalMinutes = 2; // 2-minute intervals for 1 hour
          break;
        case '24h':
          hoursToShow = 24;
          intervalMinutes = 60; // 1-hour intervals for 24 hours 
          break;
        case '7d':
          hoursToShow = 168; // 7 days
          intervalMinutes = 360; // 6-hour intervals for 7 days 
          break;
        default:
          hoursToShow = 24;
          intervalMinutes = 60;
      }
      
      totalPoints = Math.floor((hoursToShow * 60) / intervalMinutes);
      
      // Generate realistic price movement with proper trend
      for (let i = totalPoints; i >= 0; i--) {
        const timeAgo = i * intervalMinutes * 60 * 1000;
        const time = new Date(now.getTime() - timeAgo);
        
        // Calculate price progression from start to current with realistic trend
        const progress = (totalPoints - i) / totalPoints;
        
        // Create a more realistic price curve
        const trendFactor = Math.sin(progress * Math.PI * 2) * 0.1; // Add some wave pattern
        const progressionPrice = startPrice + (currentPrice - startPrice) * progress;
        
        // Add controlled volatility based on timeframe
        const volatilityFactor = timeframe === '1h' ? 0.005 : timeframe === '24h' ? 0.015 : 0.03;
        const randomVariation = (Math.random() - 0.5) * volatilityFactor;
        const trendVariation = trendFactor * volatilityFactor;
        
        let price = progressionPrice * (1 + randomVariation + trendVariation);
        
        // Ensure the last point is exactly the current price
        if (i === 0) {
          price = currentPrice;
        }
        
        data.push({
          time: time.toISOString(),
          price: Math.max(price, 0), // Ensure price is never negative
          timestamp: time.getTime(),
          formattedTime: formatTimeForTimeframe(time, timeframe),
          fullTime: time.toLocaleString(),
          interval: getIntervalLabel(timeframe)
        });
      }
      
      setChartData(data);
      setIsLoading(false);
    };

    generateRealistic24hData();
  }, [crypto, timeframe]);

  const formatTimeForTimeframe = (date, timeframe) => {
    switch (timeframe) {
      case '1h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '24h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '7d':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
               date.toLocaleTimeString([], { hour: '2-digit' });
      default:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getIntervalLabel = (timeframe) => {
    switch (timeframe) {
      case '1h': return '2-minute intervals';
      case '24h': return '1-hour intervals';
      case '7d': return '6-hour intervals';
      default: return '1-hour intervals';
    }
  };

  const priceChange = parseFloat(crypto.priceChangePercent || 0);
  const isPositive = priceChange >= 0;

  const getTimeframeInfo = () => {
    switch (timeframe) {
      case '1h': 
        return { 
          label: 'Last Hour', 
          description: 'Price movement over the last 60 minutes',
          points: '30 data points'
        };
      case '24h': 
        return { 
          label: 'Last 24 Hours', 
          description: 'Price movement over the last 24 hours',
          points: '24 data points'
        };
      case '7d': 
        return { 
          label: 'Last 7 Days', 
          description: 'Price movement over the last 7 days',
          points: '28 data points'
        };
      default: 
        return { 
          label: 'Last 24 Hours', 
          description: 'Price movement over the last 24 hours',
          points: '24 data points'
        };
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {data.fullTime}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            ${data.price.toFixed(data.price >= 1 ? 2 : 6)}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {data.interval}
          </p>
        </div>
      );
    }
    return null;
  };

  const calculatePriceStats = () => {
    if (chartData.length === 0) return { high: 0, low: 0, change: 0, changePercent: 0 };
    
    const prices = chartData.map(d => d.price);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const firstPrice = chartData[0]?.price || 0;
    const lastPrice = chartData[chartData.length - 1]?.price || 0;
    const change = lastPrice - firstPrice;
    const changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0;
    
    return { high, low, change, changePercent };
  };

  const stats = calculatePriceStats();
  const timeframeInfo = getTimeframeInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {crypto.symbol?.replace('USDT', '').slice(0, 3)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {crypto.symbol?.replace('USDT', '')} / USDT
              </h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  ${parseFloat(crypto.lastPrice).toFixed(parseFloat(crypto.lastPrice) >= 1 ? 2 : 6)}
                </span>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
                  isPositive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Timeframe Selector */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {timeframeInfo.label}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {timeframeInfo.description}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {[
                { key: '1h', label: '1 Hour' },
                { key: '24h', label: '24 Hours' },
                { key: '7d', label: '7 Days' }
              ].map((tf) => (
                <button
                  key={tf.key}
                  onClick={() => setTimeframe(tf.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timeframe === tf.key
                      ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:scale-105'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          {isLoading ? (
            <div className="h-96 w-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Loading {timeframeInfo.label} Chart</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Generating {timeframeInfo.points}...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop 
                        offset="5%" 
                        stopColor={isPositive ? "#10b981" : "#ef4444"} 
                        stopOpacity={0.4}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={isPositive ? "#10b981" : "#ef4444"} 
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis 
                    dataKey="formattedTime"
                    stroke="#6b7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    stroke="#6b7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value.toFixed(value >= 1 ? 2 : 4)}`}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    strokeWidth={3}
                    fill="url(#priceGradient)"
                    dot={false}
                    activeDot={{ 
                      r: 6, 
                      fill: isPositive ? "#10b981" : "#ef4444",
                      stroke: '#fff',
                      strokeWidth: 2
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Enhanced Stats */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ${parseFloat(crypto.lastPrice).toFixed(parseFloat(crypto.lastPrice) >= 1 ? 2 : 6)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">{timeframe} High</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                ${stats.high.toFixed(stats.high >= 1 ? 2 : 6)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">{timeframe} Low</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                ${stats.low.toFixed(stats.low >= 1 ? 2 : 6)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">{timeframe} Change</p>
              <p className={`text-lg font-semibold ${stats.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">24h Volume</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ${(parseFloat(crypto.volume || 0) / 1e6).toFixed(2)}M
              </p>
            </div>
          </div>
          
          {/* Chart Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                <Activity className="w-4 h-4" />
                <span className="font-medium">Chart Information</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {chartData.length} data points • {getIntervalLabel(timeframe)}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-green-700 dark:text-green-300">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Time Range</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {timeframeInfo.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoChart;