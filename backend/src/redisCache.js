//Create a new file to handle caching disaster data:
import redis from './redis.js';

const CACHE_EXPIRY = 300; // Cache expiry time in seconds (5 minutes)

export const cacheData = async (key, data) => {
    await redis.set(key, JSON.stringify(data), 'EX', CACHE_EXPIRY);
    console.log(`Cached data under key: ${key}`);
};

export const getCachedData = async (key) => {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
};

export const deleteCache = async (key) => {
    await redis.del(key);
    console.log(`Deleted cache for key: ${key}`);
};
