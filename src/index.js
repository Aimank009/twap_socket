require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const TWAPOracle = require('./TWAPOracle');

// Configuration
const PORT = process.env.PORT || 8080;
const PRICE_BROADCAST_INTERVAL_MS = parseInt(process.env.PRICE_BROADCAST_INTERVAL_MS || '300');
const GRID_INTERVAL_SECONDS = parseInt(process.env.GRID_INTERVAL_SECONDS || '5');
const HYPERLIQUID_WS_URL = process.env.HYPERLIQUID_WS_URL || 'wss://api.hyperliquid.xyz/ws';

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws/prices' });
const settlementWss = new WebSocket.Server({ server, path: '/ws/settlements' });

// Initialize TWAP Oracle
const oracle = new TWAPOracle(HYPERLIQUID_WS_URL);

// Connection counters
let priceClientCount = 0;
let settlementClientCount = 0;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Mercury TWAP Socket',
    uptime: process.uptime(),
    connected_to_hyperliquid: oracle.isConnected(),
    price_clients: priceClientCount,
    settlement_clients: settlementClientCount,
    current_price: oracle.getCurrentPrice()
  });
});

// Get current price
app.get('/api/price', (req, res) => {
  const price = oracle.getCurrentPrice();
  if (price) {
    res.json(price);
  } else {
    res.status(503).json({ error: 'No price data available yet' });
  }
});

// Get TWAP for a specific timeperiod
app.get('/api/twap/:timeperiodId', (req, res) => {
  const timeperiodId = parseInt(req.params.timeperiodId);
  const twap = oracle.getFinalizedPrice(timeperiodId) || oracle.calculateTWAP(timeperiodId);
  
  if (twap !== null) {
    res.json({
      timeperiod_id: timeperiodId,
      twap: twap,
      twap_usd: (twap / 1e8).toFixed(6),
      history: oracle.getPriceHistory(timeperiodId)
    });
  } else {
    res.status(404).json({ error: 'No data for this timeperiod' });
  }
});

// WebSocket connection handler for price feed
wss.on('connection', (ws, req) => {
  priceClientCount++;
  console.log(`📡 New price client connected (total: ${priceClientCount})`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Mercury TWAP price feed',
    timestamp: Math.floor(Date.now() / 1000)
  }));

  // Send current price immediately
  const currentPrice = oracle.getCurrentPrice();
  if (currentPrice) {
    ws.send(JSON.stringify(currentPrice));
  }

  ws.on('close', () => {
    priceClientCount--;
    console.log(`📡 Price client disconnected (total: ${priceClientCount})`);
  });

  ws.on('error', (error) => {
    console.error('Price WebSocket error:', error);
  });
});

// WebSocket connection handler for settlement feed
settlementWss.on('connection', (ws, req) => {
  settlementClientCount++;
  console.log(`🎯 New settlement client connected (total: ${settlementClientCount})`);

  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to settlement feed',
    timestamp: Math.floor(Date.now() / 1000)
  }));

  ws.on('close', () => {
    settlementClientCount--;
    console.log(`🎯 Settlement client disconnected (total: ${settlementClientCount})`);
  });

  ws.on('error', (error) => {
    console.error('Settlement WebSocket error:', error);
  });
});

// Broadcast price updates to all connected clients
function broadcastPrice() {
  const price = oracle.getCurrentPrice();
  
  if (price) {
    const timestamp = Math.floor(Date.now() / 1000);
    const timeperiodId = Math.floor(timestamp / GRID_INTERVAL_SECONDS) * GRID_INTERVAL_SECONDS;
    
    // Store snapshot in history
    oracle.addPriceSnapshot(timeperiodId, price.price_raw, timestamp, GRID_INTERVAL_SECONDS);
    
    // Broadcast to all price feed clients
    const message = JSON.stringify(price);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

// Settlement task - runs every grid interval
function settlementTask() {
  const currentTime = Math.floor(Date.now() / 1000);
  const currentBoundary = Math.floor(currentTime / GRID_INTERVAL_SECONDS) * GRID_INTERVAL_SECONDS;
  const gridToSettle = currentBoundary - GRID_INTERVAL_SECONDS;
  
  // Calculate and finalize TWAP for the previous period
  const twap = oracle.finalizeTWAP(gridToSettle);
  
  if (twap !== null) {
    const settlement = {
      type: 'settlement',
      timeperiod_id: gridToSettle.toString(),
      price: twap.toString(),
      price_usd: (twap / 1e8).toFixed(6),
      timestamp: currentTime
    };
    
    console.log(`🎯 Settlement | Period: ${gridToSettle} | TWAP: ${settlement.price_usd}`);
    
    // Broadcast to all settlement clients
    const message = JSON.stringify(settlement);
    settlementWss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

// Cleanup old history every hour
function cleanupTask() {
  oracle.cleanupOldHistory();
}

// Start the server
async function start() {
  try {
    console.log('🚀 Starting Mercury TWAP Socket Server...');
    console.log(`📊 Configuration:`);
    console.log(`   - Port: ${PORT}`);
    console.log(`   - Price Broadcast Interval: ${PRICE_BROADCAST_INTERVAL_MS}ms`);
    console.log(`   - Grid Interval: ${GRID_INTERVAL_SECONDS}s`);
    console.log(`   - Hyperliquid WebSocket: ${HYPERLIQUID_WS_URL}`);
    
    // Connect to Hyperliquid WebSocket
    await oracle.connect();
    
    // Wait for first price
    console.log('⏳ Waiting for first price update...');
    let attempts = 0;
    while (!oracle.getCurrentPrice() && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!oracle.getCurrentPrice()) {
      console.error('❌ Failed to receive initial price. Starting anyway...');
    } else {
      console.log('✅ Received first price update');
    }
    
    // Start price broadcasting
    setInterval(broadcastPrice, PRICE_BROADCAST_INTERVAL_MS);
    console.log(`📡 Price broadcast task started (every ${PRICE_BROADCAST_INTERVAL_MS}ms)`);
    
    // Start settlement task (aligned to grid intervals)
    const msUntilNextBoundary = (GRID_INTERVAL_SECONDS - (Math.floor(Date.now() / 1000) % GRID_INTERVAL_SECONDS)) * 1000;
    setTimeout(() => {
      settlementTask(); // Run first settlement
      setInterval(settlementTask, GRID_INTERVAL_SECONDS * 1000);
      console.log(`🎯 Settlement task started (every ${GRID_INTERVAL_SECONDS}s)`);
    }, msUntilNextBoundary);
    
    // Start cleanup task (every hour)
    setInterval(cleanupTask, 3600000);
    
    // Start HTTP server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📡 Price WebSocket: ws://0.0.0.0:${PORT}/ws/prices`);
      console.log(`🎯 Settlement WebSocket: ws://0.0.0.0:${PORT}/ws/settlements`);
      console.log(`🏥 Health check: http://0.0.0.0:${PORT}/`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start the application
start();
