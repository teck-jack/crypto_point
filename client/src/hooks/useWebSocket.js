import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

export const useWebSocket = () => {
  const [cryptoData, setCryptoData] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [priceHistory, setPriceHistory] = useState({});
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      setConnectionStatus('connecting');
      wsRef.current = new WebSocket(WEBSOCKET_URL);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        toast.success('Connected to live market data');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'priceUpdate' && message.data) {
            const data = message.data;
            
            // Update crypto data
            setCryptoData(prev => ({
              ...prev,
              [data.s]: {
                symbol: data.s,
                lastPrice: data.c,
                priceChange: data.P,
                priceChangePercent: data.p,
                volume: data.v,
                highPrice: data.h,
                lowPrice: data.l,
                openPrice: data.o,
                count: data.n,
                timestamp: Date.now()
              }
            }));

            // Update price history for charts
            setPriceHistory(prev => {
              const symbol = data.s;
              const newPoint = {
                price: parseFloat(data.c),
                timestamp: Date.now(),
                time: new Date().toISOString()
              };

              const currentHistory = prev[symbol] || [];
              const updatedHistory = [...currentHistory, newPoint].slice(-100); // Keep last 100 points

              return {
                ...prev,
                [symbol]: updatedHistory
              };
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        } else {
          toast.error('Connection lost. Please refresh to reconnect.');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    cryptoData,
    connectionStatus,
    priceHistory,
    reconnect: connect
  };
};