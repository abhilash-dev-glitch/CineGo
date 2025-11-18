const dotenv = require('dotenv');
const path = require('path');
const { connectRedis, getRedisClient, disconnectRedis } = require('./config/redis');

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const testRedisConnection = async () => {
  console.log('🧪 Testing Redis connection...\n');
  
  try {
    // Connect to Redis
    const client = await connectRedis();
    
    if (!client) {
      console.log('❌ Redis connection failed - client is null');
      process.exit(1);
    }
    
    console.log('✅ Redis connected successfully!\n');
    
    // Test basic operations
    console.log('🧪 Testing SET operation...');
    await client.set('test_key', 'test_value', 'EX', 10);
    console.log('✅ SET operation successful\n');
    
    console.log('🧪 Testing GET operation...');
    const value = await client.get('test_key');
    console.log(`✅ GET operation successful - Value: ${value}\n`);
    
    console.log('🧪 Testing DEL operation...');
    await client.del('test_key');
    console.log('✅ DEL operation successful\n');
    
    console.log('🧪 Testing seat lock simulation...');
    const seatKey = 'seat_lock:test_showtime:A-1';
    const lockData = JSON.stringify({ 
      userId: 'test_user_123', 
      lockedAt: new Date().toISOString() 
    });
    
    const lockResult = await client.set(seatKey, lockData, 'EX', 600, 'NX');
    console.log(`✅ Seat lock result: ${lockResult}\n`);
    
    const lockedData = await client.get(seatKey);
    console.log(`✅ Retrieved lock data: ${lockedData}\n`);
    
    await client.del(seatKey);
    console.log('✅ Cleaned up test lock\n');
    
    console.log('🎉 All Redis tests passed!\n');
    
    // Disconnect
    await disconnectRedis();
    console.log('✅ Redis disconnected');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

testRedisConnection();
