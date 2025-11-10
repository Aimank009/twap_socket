const WebSocket = require('ws');

const RAILWAY_URL = 'wss://twapsocket-production.up.railway.app';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 Testing Mercury TWAP Socket Deployment');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log(`🌐 Railway URL: ${RAILWAY_URL}`);
console.log('');

// Test 1: Price Feed WebSocket
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Test 1: Price Feed WebSocket');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const priceWs = new WebSocket(`${RAILWAY_URL}/ws/prices`);
let priceUpdateCount = 0;

priceWs.on('open', () => {
    console.log('✅ Connected to price feed');
});

priceWs.on('message', (data) => {
    const update = JSON.parse(data.toString());
    
    if (update.type === 'connected') {
        console.log(`📡 ${update.message}`);
    } else if (update.price_usd) {
        priceUpdateCount++;
        console.log(`💹 Price Update #${priceUpdateCount}: $${update.price_usd.toFixed(6)} (Raw: ${update.price_raw})`);
        
        // Stop after 5 price updates
        if (priceUpdateCount >= 5) {
            console.log('✅ Price feed test PASSED (received 5 updates)');
            priceWs.close();
            testSettlements();
        }
    }
});

priceWs.on('error', (error) => {
    console.log('❌ Price feed error:', error.message);
    process.exit(1);
});

priceWs.on('close', () => {
    console.log('📡 Price feed connection closed');
});

// Test 2: Settlement Feed WebSocket
function testSettlements() {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 2: Settlement Feed WebSocket');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const settlementWs = new WebSocket(`${RAILWAY_URL}/ws/settlements`);
    let settlementCount = 0;
    
    settlementWs.on('open', () => {
        console.log('✅ Connected to settlement feed');
    });
    
    settlementWs.on('message', (data) => {
        const update = JSON.parse(data.toString());
        
        if (update.type === 'connected') {
            console.log(`🎯 ${update.message}`);
            console.log('⏳ Waiting for next settlement (every 5 seconds)...');
        } else if (update.type === 'settlement') {
            settlementCount++;
            console.log(`🎯 Settlement #${settlementCount}:`);
            console.log(`   Timeperiod: ${update.timeperiod_id}`);
            console.log(`   TWAP Price: $${update.price_usd}`);
            console.log(`   Raw Price: ${update.price}`);
            
            // Stop after 2 settlements
            if (settlementCount >= 2) {
                console.log('✅ Settlement feed test PASSED (received 2 settlements)');
                settlementWs.close();
                showSummary();
            }
        }
    });
    
    settlementWs.on('error', (error) => {
        console.log('❌ Settlement feed error:', error.message);
        process.exit(1);
    });
    
    settlementWs.on('close', () => {
        console.log('🎯 Settlement feed connection closed');
    });
}

function showSummary() {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ Your TWAP Socket is working perfectly!');
    console.log('');
    console.log('📡 Your WebSocket URLs:');
    console.log('');
    console.log('   Price Feed:');
    console.log(`   wss://twapsocket-production.up.railway.app/ws/prices`);
    console.log('');
    console.log('   Settlement Feed:');
    console.log(`   wss://twapsocket-production.up.railway.app/ws/settlements`);
    console.log('');
    console.log('💹 Your API URLs:');
    console.log('');
    console.log('   Current Price:');
    console.log(`   https://twapsocket-production.up.railway.app/api/price`);
    console.log('');
    console.log('   Health Check:');
    console.log(`   https://twapsocket-production.up.railway.app/`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Next Steps:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Update your Mercury frontend with these URLs:');
    console.log('');
    console.log('const TWAP_SOCKET_URL = "wss://twapsocket-production.up.railway.app";');
    console.log('');
    console.log('const priceWs = new WebSocket(`${TWAP_SOCKET_URL}/ws/prices`);');
    console.log('const settlementWs = new WebSocket(`${TWAP_SOCKET_URL}/ws/settlements`);');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
}

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught error:', error.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('');
    console.log('⏱️  Test timeout after 30 seconds');
    console.log('⚠️  This might indicate the WebSocket connections are not receiving data');
    process.exit(1);
}, 30000);
