const redis = require('../config/redis')

class Cache {
    static async getCache(key) {
        const result = await redis.get(key, function(err, reply) {
            if (err) {
                throw new Error('got error when get redis. err : ', err);
            } else {
                return reply
            }
        });
        return result
    }

    static async setCache(key, value, ttl) {
        redis.setEx(key, 60*ttl, value, () => {});
    }
}

module.exports = Cache;