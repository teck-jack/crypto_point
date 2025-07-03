## ✨ Features

### 📊 **Real-Time Market Data**
- 🔄 Live cryptocurrency prices from CoinGecko API
- 📈 Real-time price changes and 24h statistics
- 🏆 Market cap rankings and trading volumes
- ⚡ Auto-refresh every 30 seconds

### 🎯 **Advanced Analytics**
- 📊 Interactive price charts with multiple timeframes (1h, 24h, 7d, 30d, 1y)
- 📈 Historical price data visualization
- 🎨 Beautiful area charts with gradient fills
- 📋 Comprehensive market statistics

### 🔥 **Trending & Discovery**
- ⭐ Trending cryptocurrencies section
- 🔍 Advanced search and filtering
- 📊 Sort by market cap, price, change, or volume
- 🎯 Filter by favorites, gainers, losers, or trending

### ❤️ **Personalization**
- 💾 Favorite cryptocurrencies (localStorage)
- 🌙 Dark/Light theme toggle
- 📱 Responsive design for all devices
- 🎨 Modern, clean UI with smooth animations

### 📄 **Export & Reports**
- 📊 Generate PDF reports with market analysis
- 📋 Export data to CSV format
- 📈 Portfolio performance summaries
- 📅 Timestamped market snapshots

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ **React 18** - Modern React with hooks
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📊 **Recharts** - Beautiful chart library
- 🔥 **React Hot Toast** - Elegant notifications
- 📄 **jsPDF** - PDF generation
- 🖼️ **html2canvas** - Screenshot capabilities

### **Backend**
- 🟢 **Node.js** - JavaScript runtime
- 🚀 **Express.js** - Web application framework
- 🔒 **Helmet** - Security middleware
- 📝 **Morgan** - HTTP request logger
- 🌐 **CORS** - Cross-origin resource sharing

### **APIs & Data**
- 🪙 **CoinGecko API** - Cryptocurrency market data
- 💾 **localStorage** - Client-side data persistence
- 🔄 **RESTful APIs** - Clean API architecture

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/teck-jack/crypto_point.git
cd cryptopulse
```

------------------------------------------------------------------------------------------------------
2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm init -y 
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```
------------------------------------------------------------------------------------------------------

3. **Environment Setup**
```bash
# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```
------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------
4. **Start the application**
```bash
# Development mode (runs both client and server)
npm run dev

# Or run separately
node index.js  # Backend on port 5000
npm run dev  # Frontend on port 5173
```
-------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------
5. **Open your browser**
```
http://localhost:5173
```
