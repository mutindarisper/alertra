import redis from './redis.js';

const publisher = redis.duplicate();
const subscriber = redis.duplicate();

export const publishMessage = async (channel, message) => {
    try {
        const messageString = JSON.stringify(message);
        await publisher.publish(channel, messageString);
        console.log(`Message published to channel "${channel}":`, messageString);
    } catch (error) {
        console.error(`Error publishing message to channel "${channel}":`, error);
    }
};

export const subscribeToChannel = (channel, callback ) => {
    subscriber.subscribe(channel, (err) => {
        if (err) {
            console.error(`Failed to subscribe to channel "${channel}":`, err);
        } else {
            console.log(`Subscribed to channel "${channel}"`);
        }
    });

    subscriber.on('message', (subChannel, message) => {
        if (subChannel === channel) {
            callback(JSON.parse(message));
        }
    });
};
