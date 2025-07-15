const redis = require('redis');

// Create a Redis client
const client = redis.createClient();

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.connect();

module.exports = client; 