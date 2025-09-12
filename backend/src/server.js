import express from 'express';
import { WebSocketServer } from 'ws';  // Use the correct import for WebSocketServer
import { subscribeToChannel, publishMessage } from './redisPubSub.js';
import { fetchDisasterData } from './fetchDisasters.js';

const app = express();
const PORT = 5001;

// WebSocket server
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
const wss = new WebSocketServer({ server });  // Corrected here

// Fetch disaster data periodically (e.g., every 10 minutes)
setInterval(fetchDisasterData, 600000); // 10 minutes in milliseconds

// Subscribe to Redis channel for real-time alerts
subscribeToChannel('disaster-alerts', (alert) => {
    console.log('Broadcasting alert:', alert);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(alert));
        }
    });
});

// Optional: Endpoint to fetch cached disasters
app.get('/api/disasters/cached', async (req, res) => {
    const data = await fetchDisasterData();
    res.status(200).json(data);
});

// Endpoint to manually publish an alert
app.post('/api/alert', express.json(), async (req, res) => {
    const alert = req.body;
    const channel = 'disaster-alerts';

    await publishMessage(channel, alert);
    res.status(200).send({ message: 'Alert published' });
});

const testMessage = {
    type: 'Flood',
    location: { lat: -1.28333, lng: 36.81667 },
    severity: 'Orange',
    timestamp: new Date().toISOString(),
};
publishMessage('disaster-alerts', testMessage);

