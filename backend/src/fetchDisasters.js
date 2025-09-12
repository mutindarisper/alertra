//This file will handle fetching disaster data from the GDACS API, caching it, and publishing updates.
import axios from 'axios';
import { cacheData, getCachedData } from './redisCache.js';
import { publishMessage } from './redisPubSub.js';

const CACHE_KEY = 'recent_disasters';

export const fetchDisasterData = async () => {
    // Check cache first
    const cachedData = await getCachedData(CACHE_KEY);
    if (cachedData) {
        console.log('Returning cached disaster data');
        return cachedData;
    }

    // Fetch from GDACS API
    const response = await axios.get('https://www.gdacs.org/api/events/geteventlist');
    const disasters = response.data.data;

    // Cache the data
    await cacheData(CACHE_KEY, disasters);

    // Publish new disasters as alerts
    disasters.forEach((disaster) => {
        publishMessage('disaster-alerts', disaster);
    });

    return disasters;
};
