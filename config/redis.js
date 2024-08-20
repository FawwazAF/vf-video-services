// redisClient.js
const {createClient} = require('redis');

const redisClient = createClient();

redisClient.connect();

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});


module.exports = redisClient;
