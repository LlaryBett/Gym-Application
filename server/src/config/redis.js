// server/src/config/redis.js
import Redis from 'ioredis';

class RedisClient {
  constructor() {
    this.client = null;
  }

  async connect() {
    try {
      // Check if we're in production (Render) or development
      const isProduction = process.env.NODE_ENV === 'production' || process.env.REDIS_HOST?.includes('upstash');
      
      if (isProduction) {
        // Upstash configuration (production)
        console.log('🔌 Connecting to Upstash Redis...');
        this.client = new Redis({
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
          tls: {},  // Required for Upstash
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3
        });
      } else {
        // Local Redis configuration (development)
        console.log('🔌 Connecting to local Redis...');
        this.client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || '',
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          }
        });
      }

      // Event handlers
      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
      });

      this.client.on('ready', () => {
        console.log('✅ Redis ready to accept commands');
      });

      // Test connection
      await this.client.ping();
      console.log('✅ Redis ping successful');
      
      return this.client;
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      throw error;
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      console.log('🔌 Redis disconnected');
    }
  }

  // Helper method to check connection status
  isConnected() {
    return this.client && this.client.status === 'ready';
  }
}

export default new RedisClient();