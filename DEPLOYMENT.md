# Mercury TWAP Socket - Railway Deployment Guide

## Quick Deploy to Railway

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   cd mercury_twap_socket
   git init
   git add .
   git commit -m "Initial commit - Mercury TWAP Socket"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `mercury_twap_socket` repository
   - Railway will auto-detect the Node.js project

3. **Configure Environment Variables** (if needed):
   - Go to your project settings
   - Add variables:
     - `PORT` (Railway sets this automatically)
     - `PRICE_BROADCAST_INTERVAL_MS=300`
     - `GRID_INTERVAL_SECONDS=5`

4. **Get your URL:**
   - Railway will provide a public URL like: `https://mercury-twap-socket-production.up.railway.app`
   - Your WebSocket endpoints will be:
     - `wss://mercury-twap-socket-production.up.railway.app/ws/prices`
     - `wss://mercury-twap-socket-production.up.railway.app/ws/settlements`

### Option 2: Deploy from CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd mercury_twap_socket
railway init

# Deploy
railway up

# Set environment variables (optional)
railway variables set PRICE_BROADCAST_INTERVAL_MS=300
railway variables set GRID_INTERVAL_SECONDS=5

# View logs
railway logs
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port (Railway sets automatically) |
| `PRICE_BROADCAST_INTERVAL_MS` | `300` | How often to broadcast prices (ms) |
| `GRID_INTERVAL_SECONDS` | `5` | TWAP calculation interval (seconds) |
| `HYPERLIQUID_WS_URL` | `wss://api.hyperliquid.xyz/ws` | Hyperliquid WebSocket URL |

## Testing Your Deployment

Once deployed, test with:

```bash
# Check health
curl https://your-railway-url.railway.app/

# Get current price
curl https://your-railway-url.railway.app/api/price

# Get TWAP for specific period
curl https://your-railway-url.railway.app/api/twap/1699632000
```

## WebSocket Client Example

```javascript
// Price feed
const priceWs = new WebSocket('wss://your-railway-url.railway.app/ws/prices');

priceWs.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Price:', data.price_usd);
};

// Settlement feed
const settlementWs = new WebSocket('wss://your-railway-url.railway.app/ws/settlements');

settlementWs.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'settlement') {
    console.log('Settlement:', data.timeperiod_id, data.price_usd);
  }
};
```

## Monitoring

- **Health Check:** `GET /`
- **Railway Dashboard:** View logs, metrics, and resource usage
- **Automatic Restarts:** Railway will restart on failure (max 10 retries)

## Troubleshooting

### WebSocket connection fails
- Ensure your Railway URL uses `wss://` not `ws://`
- Check Railway logs for connection errors

### No price updates
- Verify Hyperliquid WebSocket is reachable
- Check logs for connection status

### High memory usage
- Old price history is cleaned every hour
- Adjust `GRID_INTERVAL_SECONDS` if needed

## Cost Estimation

Railway free tier includes:
- $5 free credit per month
- Enough for ~500 hours of runtime
- This service should stay within free tier limits

## Integration with Mercury Frontend

Update your frontend to use the Railway URL:

```javascript
// In your Mercury frontend config
const TWAP_SOCKET_URL = 'wss://mercury-twap-socket-production.up.railway.app';

// Connect to price feed
const priceWs = new WebSocket(`${TWAP_SOCKET_URL}/ws/prices`);

// Connect to settlement feed
const settlementWs = new WebSocket(`${TWAP_SOCKET_URL}/ws/settlements`);
```
