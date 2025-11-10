const WebSocket = require('ws');

class TWAPOracle {
  constructor(wsUrl = 'wss://api.hyperliquid.xyz/ws') {
    this.wsUrl = wsUrl;
    this.currentPrice = null;
    this.priceHistory = new Map(); // timeperiodId -> { snapshots: [], startTime, endTime }
    this.finalizedPrices = new Map();
    this.wsConnected = false;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000; // 5 seconds
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        console.log(`📡 Connecting to Hyperliquid WebSocket: ${this.wsUrl}`);
        this.ws = new WebSocket(this.wsUrl);

        this.ws.on('open', () => {
          console.log('✅ Connected to Hyperliquid WebSocket');
          const subscribeMsg = {
            method: 'subscribe',
            subscription: { type: 'allMids' }
          };
          
          this.ws.send(JSON.stringify(subscribeMsg));
          this.wsConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const response = JSON.parse(data.toString());
            
            if (response.channel === 'allMids' && response.data?.mids?.HYPE) {
              const priceUsd = parseFloat(response.data.mids.HYPE);
              const priceRaw = Math.floor(priceUsd * 1e8); // Convert to 8 decimals
              const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
              
              this.currentPrice = {
                price_raw: priceRaw,
                price_usd: priceUsd,
                timestamp: timestamp
              };
              
              // Log price updates every 10 seconds (not every message)
              if (timestamp % 10 === 0) {
                console.log(`💹 Price Update: $${priceUsd.toFixed(6)} (${priceRaw})`);
              }
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        });

        this.ws.on('error', (error) => {
          console.error('❌ WebSocket error:', error.message);
          this.wsConnected = false;
        });

        this.ws.on('close', () => {
          console.log('⚠️  WebSocket connection closed');
          this.wsConnected = false;
          this.attemptReconnect();
        });

        // Timeout if connection takes too long
        setTimeout(() => {
          if (!this.wsConnected) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Giving up.');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect().catch(err => {
        console.error('Reconnection failed:', err.message);
      });
    }, this.reconnectDelay);
  }

  addPriceSnapshot(timeperiodId, price, timestamp, intervalSecs = 5) {
    if (!this.priceHistory.has(timeperiodId)) {
      const startTime = Math.floor(timestamp / intervalSecs) * intervalSecs;
      this.priceHistory.set(timeperiodId, {
        snapshots: [],
        startTime: startTime,
        endTime: startTime + intervalSecs
      });
    }
    
    const history = this.priceHistory.get(timeperiodId);
    
    // Only add if within timeperiod range
    if (timestamp >= history.startTime && timestamp < history.endTime) {
      history.snapshots.push({ price, timestamp });
    }
  }

  calculateTWAP(timeperiodId) {
    const history = this.priceHistory.get(timeperiodId);
    
    if (!history || history.snapshots.length === 0) {
      console.log(`⚠️  No price history for timeperiod ${timeperiodId}`);
      return null;
    }
    
    if (history.snapshots.length === 1) {
      return history.snapshots[0].price;
    }

    let weightedSum = 0;
    let totalWeight = 0;
    
    // Calculate weighted sum for all intervals
    for (let i = 0; i < history.snapshots.length - 1; i++) {
      const current = history.snapshots[i];
      const next = history.snapshots[i + 1];
      const timeDiff = next.timestamp - current.timestamp;
      
      weightedSum += current.price * timeDiff;
      totalWeight += timeDiff;
    }
    
    // Handle last snapshot to end time
    const last = history.snapshots[history.snapshots.length - 1];
    if (last.timestamp < history.endTime) {
      const timeDiff = history.endTime - last.timestamp;
      weightedSum += last.price * timeDiff;
      totalWeight += timeDiff;
    }
    
    if (totalWeight > 0) {
      const twap = Math.floor(weightedSum / totalWeight);
      console.log(`📊 Calculated TWAP for period ${timeperiodId}: ${twap} (${history.snapshots.length} snapshots)`);
      return twap;
    } else {
      // Fallback to simple average
      const sum = history.snapshots.reduce((acc, s) => acc + s.price, 0);
      return Math.floor(sum / history.snapshots.length);
    }
  }

  finalizeTWAP(timeperiodId) {
    if (this.finalizedPrices.has(timeperiodId)) {
      return this.finalizedPrices.get(timeperiodId);
    }
    
    const twap = this.calculateTWAP(timeperiodId);
    if (twap !== null) {
      this.finalizedPrices.set(timeperiodId, twap);
    }
    
    return twap;
  }

  getCurrentPrice() {
    return this.currentPrice;
  }

  isConnected() {
    return this.wsConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  getPriceHistory(timeperiodId) {
    return this.priceHistory.get(timeperiodId);
  }

  getFinalizedPrice(timeperiodId) {
    return this.finalizedPrices.get(timeperiodId);
  }

  // Clean up old price history (older than 1 hour)
  cleanupOldHistory() {
    const currentTime = Math.floor(Date.now() / 1000);
    const oneHourAgo = currentTime - 3600;
    
    for (const [timeperiodId, history] of this.priceHistory.entries()) {
      if (history.endTime < oneHourAgo) {
        this.priceHistory.delete(timeperiodId);
        console.log(`🧹 Cleaned up old history for timeperiod ${timeperiodId}`);
      }
    }
  }
}

module.exports = TWAPOracle;
