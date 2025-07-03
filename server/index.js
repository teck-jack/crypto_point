const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'CryptoPulse API is running'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// WebSocket Server for real-time updates
const wss = new WebSocket.Server({ server });

const cryptoSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT',
  'SOLUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT'
];

// Store initial open prices to handle first update correctly
const initialOpenPrices = {};

let binanceWs = null;

const connectToBinance = () => {
  const streamUrl = `wss://stream.binance.com:9443/ws/${cryptoSymbols.map(s => s.toLowerCase() + '@ticker').join('/')}`;
  
  binanceWs = new WebSocket(streamUrl);
  
  binanceWs.on('open', () => {
    console.log(' Connected to Binance WebSocket');
    binanceWs.send(JSON.stringify({ method: 'SUBSCRIBE', params: cryptoSymbols.map(s => s.toLowerCase() + '@ticker'), id: 1 }));
  });
  
 binanceWs.on('message', (data) => {
  try {
    const parsedData = JSON.parse(data);
    if (parsedData.e === '24hrTicker') {
      const symbol = parsedData.s.replace('USDT', '');
      const currentPrice = parseFloat(parsedData.c);
      const priceChange = parseFloat(parsedData.p); // Price change in currency
      const percentChange = parseFloat(parsedData.P); // Binance's 24h percentage change
      
      // Always use Binance's provided percentage change to be accurate
      const transformedData = {
        type: 'priceUpdate',
        data: {
          s: symbol,
          c: currentPrice.toString(),
          P: priceChange.toFixed(2),
          p: percentChange.toFixed(2), // Use Binance's percentage directly
          v: parsedData.v,
          h: parsedData.h,
          l: parsedData.l,
          o: parsedData.o, // Use Binance's open price
          n: parsedData.n,
        }
      };
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(transformedData));
        }
      });
    }
  } catch (error) {
    console.error('Error parsing Binance data:', error.message);
  }
});
  binanceWs.on('close', () => {
    console.log('Binance WebSocket closed, reconnecting in 5 seconds...');
    setTimeout(connectToBinance, 5000);
  });
  
  binanceWs.on('error', (error) => {
    console.error('Binance WebSocket error:', error.message);
  });
};

// Handle client connections
wss.on('connection', (ws) => {
  console.log('🔗 New client connected');
  
  ws.on('close', () => {
    console.log('🔌 Client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });
});

// Start server
const startServer = () => {
  connectToBinance();
  
  server.listen(PORT, () => {
    console.log(` CryptoPulse server running on port ${PORT}`);
    console.log(` WebSocket server ready for real-time crypto data`);
    console.log(` Using localStorage for favorites`);
  });
};

startServer();
