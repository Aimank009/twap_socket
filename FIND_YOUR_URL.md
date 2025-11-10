# 🎯 Quick Guide: Get Your Railway Public URL

## ✅ What You've Completed So Far:

1. ✅ Code pushed to GitHub: https://github.com/Aimank009/twap_socket
2. ✅ Railway project created and deploying

---

## 📍 How to Get Your Public Railway URL:

### In Railway Dashboard:

1. **Go to your project**: 
   - You should see your `twap_socket` service

2. **Click on the service card**

3. **Go to "Settings" tab**

4. **Scroll to "Networking" section**

5. **Click "Generate Domain"** (if not already generated)
   - Railway will give you a URL like: `twap-socket-production.up.railway.app`
   - Or it might look like: `twap-socket-production-asdf.up.railway.app`

6. **Copy that URL** (without https://)

---

## 🧪 Test Your Deployment:

Once you have your URL (let's say it's `twap-socket-production.up.railway.app`):

### Test in Terminal:

```bash
# Health check
curl https://twap-socket-production.up.railway.app/

# Get current price
curl https://twap-socket-production.up.railway.app/api/price

# Get TWAP for a timeperiod
curl https://twap-socket-production.up.railway.app/api/twap/1762787520
```

### Test in Browser:

Open: `https://your-railway-url.railway.app/`

You should see:
```json
{
  "status": "ok",
  "service": "Mercury TWAP Socket",
  "uptime": 123.456,
  "connected_to_hyperliquid": true,
  "current_price": { ... }
}
```

---

## 🔌 Connect from Frontend:

Once you confirm it's working, use these in your Mercury frontend:

```javascript
// Replace YOUR_RAILWAY_URL with your actual URL
const TWAP_SOCKET_URL = 'wss://twap-socket-production.up.railway.app';

// Price feed
const priceWs = new WebSocket(`${TWAP_SOCKET_URL}/ws/prices`);

priceWs.onopen = () => {
  console.log('✅ Connected to TWAP price feed');
};

priceWs.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Price:', data.price_usd);
  // Update your UI here
};

// Settlement feed
const settlementWs = new WebSocket(`${TWAP_SOCKET_URL}/ws/settlements`);

settlementWs.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'settlement') {
    console.log('Settlement:', data.timeperiod_id, data.price_usd);
    // Handle settlement in your UI
  }
};
```

---

## 📊 Monitor Your Deployment:

### Railway Dashboard:
- **Logs**: Real-time server output
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: History of all deployments

### Check Logs for Success:
You should see:
```
✅ Connected to Hyperliquid WebSocket
✅ Server running on port 8080
📊 Calculated TWAP for period...
🎯 Settlement | Period: ... | TWAP: ...
💹 Price Update: $41.xxx
```

---

## 🐛 Troubleshooting:

### If deployment is still in progress:
- Wait 2-3 more minutes
- Check "Deployments" tab for status
- Green = Success, Red = Failed

### If deployment failed:
- Check Railway logs for error messages
- Most common issues:
  - Missing dependencies (already fixed in package.json)
  - Port issues (Railway sets PORT automatically)

### If you see build errors:
- Railway might need a few minutes to complete
- Check the "Build Logs" tab

---

## ✅ Deployment Checklist:

- [x] Code pushed to GitHub
- [x] Railway project created
- [ ] Railway deployment successful (check logs)
- [ ] Public domain generated
- [ ] Health endpoint responding
- [ ] WebSocket endpoints working
- [ ] Frontend updated with new URL

---

## 🎉 Once Everything Works:

Your TWAP Socket server is:
- ✅ Running 24/7 on Railway
- ✅ Auto-deploying on every push to GitHub
- ✅ Broadcasting real-time HYPE prices
- ✅ Calculating and broadcasting TWAP settlements
- ✅ Ready for production use!

---

## 📞 Need Help?

Check:
1. Railway Logs (in dashboard)
2. GitHub Actions (if enabled)
3. `README.md` in your repo
4. `COMPLETE_DEPLOYMENT_GUIDE.md` for detailed steps

---

**Next Step**: Go to your Railway dashboard, find your public URL in Settings → Networking, and test it!
