# 🚀 Mercury TWAP Socket - Setup Complete!

## ✅ What We Built

A production-ready Node.js WebSocket server that:
- ✅ Connects to Hyperliquid WebSocket for real-time HYPE price data
- ✅ Calculates Time-Weighted Average Price (TWAP) for 5-second grid periods
- ✅ Broadcasts real-time prices every 300ms
- ✅ Broadcasts TWAP settlements every 5 seconds
- ✅ Auto-reconnects on disconnect
- ✅ Cleans up old data automatically
- ✅ Ready for Railway deployment

## 📁 Project Structure

```
mercury_twap_socket/
├── src/
│   ├── index.js          # Main server & WebSocket handlers
│   └── TWAPOracle.js     # TWAP calculation logic
├── package.json          # Dependencies & scripts
├── .env                  # Environment variables
├── Dockerfile            # Container configuration
├── railway.json          # Railway deployment config
├── test-client.html      # Test client UI
├── README.md            # Documentation
└── DEPLOYMENT.md        # Railway deployment guide
```

## 🎯 Current Status

### ✅ Running Successfully

Your server is currently running at:
- **Health Check:** http://localhost:8080
- **Price WebSocket:** ws://localhost:8080/ws/prices
- **Settlement WebSocket:** ws://localhost:8080/ws/settlements

### 📊 Live Metrics (from last run)

- Connected to Hyperliquid ✅
- Receiving price updates every ~300ms
- Broadcasting settlements every 5 seconds
- TWAP calculation working (17 snapshots per period)
- Last price: ~$41.58

## 🔥 Key Features

### 1. **Price Broadcasting**
```javascript
// Connects to: ws://localhost:8080/ws/prices
{
  "price_raw": 4159550000,    // 8 decimals
  "price_usd": 41.5955,       // USD value
  "timestamp": 1762787315     // Unix timestamp
}
```

### 2. **TWAP Settlements**
```javascript
// Connects to: ws://localhost:8080/ws/settlements
{
  "type": "settlement",
  "timeperiod_id": "1762787315",
  "price": "4159580000",
  "price_usd": "41.595800",
  "timestamp": 1762787320
}
```

### 3. **HTTP Endpoints**
- `GET /` - Health check & status
- `GET /api/price` - Current price
- `GET /api/twap/:timeperiodId` - Historical TWAP

## 🚀 Deploy to Railway

### Step 1: Push to GitHub

```bash
cd /Users/aimankhan/Desktop/ansh/mercury_twap_socket

# Commit your code
git add .
git commit -m "Initial commit - Mercury TWAP Socket Server"

# Create GitHub repo and push
# (Create repo on GitHub first, then:)
git remote add origin https://github.com/YOUR_USERNAME/mercury_twap_socket.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose `mercury_twap_socket`
6. Railway will auto-detect and deploy! 🎉

### Step 3: Get Your URLs

Railway will give you a URL like:
```
https://mercury-twap-socket-production.up.railway.app
```

Your WebSocket endpoints will be:
```
wss://mercury-twap-socket-production.up.railway.app/ws/prices
wss://mercury-twap-socket-production.up.railway.app/ws/settlements
```

## 🧪 Testing

### Test Locally

1. **Start the server:**
   ```bash
   cd /Users/aimankhan/Desktop/ansh/mercury_twap_socket
   npm start
   ```

2. **Open test client:**
   - Open `test-client.html` in your browser
   - Or visit http://localhost:8080

3. **Test with curl:**
   ```bash
   # Health check
   curl http://localhost:8080/
   
   # Get current price
   curl http://localhost:8080/api/price
   ```

### Test on Railway (after deployment)

```bash
# Replace with your Railway URL
RAILWAY_URL="https://your-app.railway.app"

# Health check
curl $RAILWAY_URL/

# Get current price
curl $RAILWAY_URL/api/price
```

## 🔌 Integration with Mercury Frontend

Update your Mercury frontend to connect:

```javascript
// In your config or constants file
const TWAP_SOCKET_URL = 
  process.env.NODE_ENV === 'production'
    ? 'wss://mercury-twap-socket-production.up.railway.app'
    : 'ws://localhost:8080';

// Connect to price feed
const priceWs = new WebSocket(`${TWAP_SOCKET_URL}/ws/prices`);

priceWs.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Price update:', data.price_usd);
  // Update your UI with the price
};

// Connect to settlement feed
const settlementWs = new WebSocket(`${TWAP_SOCKET_URL}/ws/settlements`);

settlementWs.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'settlement') {
    console.log('Settlement:', data.timeperiod_id, data.price_usd);
    // Handle settlement in your UI
  }
};
```

## 🎛️ Configuration

Environment variables (in `.env`):

```env
PORT=8080                           # Server port
PRICE_BROADCAST_INTERVAL_MS=300     # Broadcast every 300ms
GRID_INTERVAL_SECONDS=5             # 5-second TWAP periods
HYPERLIQUID_WS_URL=wss://api.hyperliquid.xyz/ws
```

## 📊 How TWAP Works

1. **Collection Phase:**
   - Collects price snapshots every 300ms
   - Stores in memory by timeperiod (5-second windows)

2. **Calculation:**
   ```
   TWAP = Σ(price × time_duration) / total_time
   ```
   - Weights each price by how long it lasted
   - More accurate than simple average

3. **Settlement:**
   - Finalizes TWAP at end of each 5-second period
   - Broadcasts to all connected clients
   - Caches result to avoid recalculation

4. **Cleanup:**
   - Old data (>1 hour) cleaned automatically
   - Prevents memory leaks

## 🛠️ Commands

```bash
# Install dependencies
npm install

# Start server (production)
npm start

# Start with auto-reload (development)
npm run dev

# View logs (Railway)
railway logs

# Deploy to Railway
railway up
```

## 📈 Next Steps

1. ✅ **Test locally** - Server is running, test with the HTML client
2. ✅ **Push to GitHub** - Commit and push your code
3. 🚀 **Deploy to Railway** - Follow the steps above
4. 🔌 **Integrate with frontend** - Connect Mercury UI to your WebSocket
5. 📊 **Monitor** - Watch Railway dashboard for metrics

## 💡 Tips

- **Free Tier:** Railway gives $5/month free credit (plenty for this!)
- **Auto-Deploy:** Every push to GitHub will auto-deploy
- **Logs:** View real-time logs in Railway dashboard
- **Scaling:** Railway can scale automatically if needed

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port is in use
lsof -i :8080
# Kill process if needed
kill -9 <PID>
```

### WebSocket won't connect
- Check firewall settings
- Ensure Railway URL uses `wss://` (not `ws://`)
- Check Railway logs for errors

### No price updates
- Hyperliquid WebSocket might be down
- Check server logs
- Server will auto-reconnect

## 📚 Files to Review

- `src/index.js` - Main server logic
- `src/TWAPOracle.js` - TWAP calculation
- `DEPLOYMENT.md` - Detailed deployment guide
- `test-client.html` - Test UI

---

**Status:** ✅ Ready for deployment!

**Next:** Push to GitHub → Deploy on Railway → Update Mercury frontend URLs
