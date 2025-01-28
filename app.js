const express = require('express');
const { router, wss } = require('./routes/upload.routes');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api', router);

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'subscribe' && data.sessionId) {
      ws.sessionId = data.sessionId;
    }
  });
});

// Forward upload progress events to WebSocket clients
const { uploadEmitter } = require('./services/background-upload.service');
uploadEmitter.on('progress', (progress) => {
  wss.clients.forEach((client) => {
    if (client.sessionId === progress.sessionId) {
      client.send(JSON.stringify(progress));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 