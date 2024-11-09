const redis = require("ioredis");
const { handleFileExpiry } = require('../utils/fileUtils');

// Redis connection details
const redisConfig = {
  host: 'redis-17913.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: '17913',
  password: 'xmPHVTznNJOsSj7tei8yHsKTwLybUWOv',
};

// Create Redis clients for subscriber and publisher
const subscriberClient = new redis(redisConfig);
const publisherClient = new redis(redisConfig);

// Handle Redis connection and error
[subscriberClient, publisherClient].forEach(client => {
  client.on('error', (err) => console.log('Redis Client Error', err));
  client.on('connect', () => console.log(`${client === subscriberClient ? 'Subscriber' : 'Publisher'} connected to Redis`));
});

// Listen for expiry events and handle them
subscriberClient.on('message', (channel, message) => {
  if (channel === '__keyevent@0__:expired') handleFileExpiry(message);
});

// Subscribe to expiry events
subscriberClient.subscribe('__keyevent@0__:expired');

module.exports = { subscriberClient, publisherClient };
