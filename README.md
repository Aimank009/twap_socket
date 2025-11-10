# Mercury TWAP Socket Server

WebSocket server for real-time TWAP (Time-Weighted Average Price) calculation and broadcasting for Mercury trading platform.

## Features

- 🔌 Real-time WebSocket connection to Hyperliquid
- 📊 TWAP calculation for 5-second grid periods
- 📡 Price broadcasting via WebSocket
- 🎯 Settlement notifications with TWAP prices
- 🔄 Automatic reconnection on disconnect
- 🧹 Automatic cleanup of old price history

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
PORT=8080
PRICE_BROADCAST_INTERVAL_MS=300
GRID_INTERVAL_SECONDS=5
HYPERLIQUID_WS_URL=wss://api.hyperliquid.xyz/ws
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Endpoints

### HTTP Endpoints

- `GET /` - Health check and status
- `GET /api/price` - Get current price
- `GET /api/twap/:timeperiodId` - Get TWAP for specific timeperiod

### WebSocket Endpoints

#### Price Feed: `ws://localhost:8080/ws/prices`

Broadcasts real-time price updates:
```json
{
  "price_raw": 12345678,
  "price_usd": 0.123456,
  "timestamp": 1699632000
}
```

#### Settlement Feed: `ws://localhost:8080/ws/settlements`

Broadcasts TWAP settlements every 5 seconds:
```json
{
  "type": "settlement",
  "timeperiod_id": "1699632000",
  "price": "12345678",
  "price_usd": "0.123456",
  "timestamp": 1699632005
}
```

## How TWAP Works

1. **Price Collection**: Collects price snapshots every 300ms from Hyperliquid
2. **Storage**: Groups snapshots by 5-second timeperiod
3. **Calculation**: Computes time-weighted average: `Σ(price × duration) / total_time`
4. **Settlement**: Finalizes TWAP at end of each period
5. **Broadcasting**: Sends settlement data to all connected clients

## Railway Deployment

1. Push to GitHub
2. Connect to Railway
3. Set environment variables
4. Deploy!

Railway will automatically detect the start script from `package.json`.

## Architecture

```
┌─────────────────┐
│  Hyperliquid WS │
│  (Price Feed)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  TWAP Oracle    │
│  - Collects     │
│  - Calculates   │
│  - Stores       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WebSocket      │
│  Broadcaster    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Clients        │
│  (Frontend)     │
└─────────────────┘
```

## License

MIT
