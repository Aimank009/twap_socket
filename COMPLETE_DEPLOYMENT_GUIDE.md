# 🚀 Complete Deployment Guide for Mercury TWAP Socket

## Step 1: Create GitHub Repository

1. **Go to GitHub:** https://github.com/new
2. **Repository name:** `mercury_twap_socket`
3. **Description:** "Real-time TWAP WebSocket server for Mercury trading platform"
4. **Visibility:** Public (or Private if you prefer)
5. **Click:** "Create repository"

---

## Step 2: Push Code to GitHub

Once you've created the repository, run these commands:

```bash
cd /Users/aimankhan/Desktop/ansh/mercury_twap_socket

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/mercury_twap_socket.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Example (replace with your username):**
```bash
git remote add origin https://github.com/kunal-png/mercury_twap_socket.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Railway

### Method A: Via Railway Dashboard (Easiest)

1. **Go to Railway:** https://railway.app/new

2. **Sign in with GitHub** (if not already signed in)

3. **Click:** "Deploy from GitHub repo"

4. **Select:** `mercury_twap_socket` repository

5. **Railway will automatically:**
   - Detect it's a Node.js project
   - Read the `railway.json` config
   - Install dependencies (`npm install`)
   - Start the server (`npm start`)
   - Assign a public URL

6. **Wait 2-3 minutes** for deployment to complete

7. **Get your URL:**
   - Click on your project
   - Go to "Settings" → "Domains"
   - You'll see something like: `mercury-twap-socket-production.up.railway.app`

8. **Test your deployment:**
   ```bash
   # Replace with your Railway URL
   curl https://mercury-twap-socket-production.up.railway.app/
   
   # Get current price
   curl https://mercury-twap-socket-production.up.railway.app/api/price
   ```

---

### Method B: Via Railway CLI (Alternative)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link project
cd /Users/aimankhan/Desktop/ansh/mercury_twap_socket
railway init

# Deploy
railway up

# View logs
railway logs

# Open in browser
railway open
```

---

## Step 4: Verify Deployment

Once deployed, test all endpoints:

### 1. Health Check
```bash
curl https://YOUR-APP.railway.app/
```

Expected response:
```json
{
  "status": "ok",
  "service": "Mercury TWAP Socket",
  "uptime": 123.456,
  "connected_to_hyperliquid": true,
  "price_clients": 0,
  "settlement_clients": 0,
  "current_price": {
    "price_raw": 4151350000,
    "price_usd": 41.51350,
    "timestamp": 1762787545
  }
}
```

### 2. Current Price API
```bash
curl https://YOUR-APP.railway.app/api/price
```

### 3. WebSocket (Price Feed)
```javascript
const ws = new WebSocket('wss://YOUR-APP.railway.app/ws/prices');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

### 4. WebSocket (Settlement Feed)
```javascript
const ws = new WebSocket('wss://YOUR-APP.railway.app/ws/settlements');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

---

## Step 5: Update Mercury Frontend

Once deployed, update your Mercury frontend to use the Railway URL:

### In your frontend config file:

```javascript
// src/config/constants.js (or similar)

const TWAP_SOCKET_URL = process.env.NEXT_PUBLIC_TWAP_SOCKET_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'wss://mercury-twap-socket-production.up.railway.app'
    : 'ws://localhost:8080');

export { TWAP_SOCKET_URL };
```

### Connect to WebSockets:

```javascript
import { TWAP_SOCKET_URL } from '@/config/constants';

// Price feed
const priceWs = new WebSocket(`${TWAP_SOCKET_URL}/ws/prices`);

priceWs.onopen = () => {
  console.log('✅ Connected to TWAP price feed');
};

priceWs.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.price_usd) {
    // Update your UI with the price
    updatePriceDisplay(data.price_usd);
  }
};

// Settlement feed
const settlementWs = new WebSocket(`${TWAP_SOCKET_URL}/ws/settlements`);

settlementWs.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'settlement') {
    // Handle settlement in your UI
    handleSettlement(data.timeperiod_id, data.price_usd);
  }
};
```

---

## Step 6: Monitor Your Deployment

### Railway Dashboard:
- **View Logs:** Real-time server logs
- **Metrics:** CPU, Memory, Network usage
- **Deployments:** History of all deployments
- **Environment Variables:** Manage config

### Set Environment Variables (Optional):
In Railway dashboard → Settings → Variables:
```
PRICE_BROADCAST_INTERVAL_MS=300
GRID_INTERVAL_SECONDS=5
```

---

## Quick Commands Reference

```bash
# Local Development
cd /Users/aimankhan/Desktop/ansh/mercury_twap_socket
npm start                    # Start server
npm run dev                  # Start with auto-reload

# Git Commands
git status                   # Check status
git add .                    # Stage all changes
git commit -m "message"      # Commit changes
git push                     # Push to GitHub

# Railway CLI Commands
railway login                # Login to Railway
railway init                 # Initialize project
railway up                   # Deploy
railway logs                 # View logs
railway open                 # Open in browser
railway variables set KEY=VALUE  # Set environment variable
```

---

## Troubleshooting

### Issue: Railway deployment fails

**Solution:**
1. Check Railway logs for errors
2. Verify `package.json` has correct start script
3. Ensure all dependencies are in `package.json`
4. Check Railway build logs

### Issue: WebSocket connection fails

**Solution:**
1. Use `wss://` not `ws://` for production
2. Check Railway URL is correct
3. Verify Railway app is running
4. Check browser console for CORS errors

### Issue: No price updates

**Solution:**
1. Check Railway logs
2. Verify Hyperliquid WebSocket is reachable
3. Check server is connected: `curl YOUR-APP/`
4. Server will auto-reconnect if disconnected

---

## Cost Estimation

**Railway Free Tier:**
- $5 free credit per month
- ~500 hours of runtime
- Perfect for this lightweight WebSocket server
- Should stay within free tier!

**Upgrade if needed:**
- $5/month for Hobby plan
- More resources and usage

---

## Security (Production Best Practices)

1. **Environment Variables:**
   - Don't commit `.env` to git (already in `.gitignore`)
   - Use Railway dashboard to set production variables

2. **Rate Limiting:**
   - Consider adding rate limiting for API endpoints
   - WebSocket connections are already managed

3. **CORS:**
   - Currently set to `Any` for development
   - In production, restrict to your frontend domain

---

## Next Steps After Deployment

1. ✅ Test all endpoints
2. ✅ Update Mercury frontend URLs
3. ✅ Monitor Railway logs for first 24 hours
4. ✅ Set up alerts in Railway (optional)
5. ✅ Share the API documentation with your team

---

## Support

- **Railway Docs:** https://docs.railway.app/
- **Railway Discord:** https://discord.gg/railway
- **WebSocket API Docs:** See `README.md` in project

---

**You're ready to deploy! 🚀**

Follow the steps above and your TWAP socket server will be live in minutes!
