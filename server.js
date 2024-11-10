// server.js
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';

const wss = new WebSocketServer({ port: 8080 });

// Load user credentials from JSON file
let userCreds = {};
try {
  userCreds = JSON.parse(fs.readFileSync(path.resolve('userCreds.json'), 'utf-8'));
} catch (err) {
  console.error('Error reading userCreds.json:', err);
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      // Check if the incoming message is a login attempt
      if (data.type === 'login') {
        const { username, password } = data;
        
        // Validate credentials
        if (userCreds[username] === password) {
          const successResponse = {
            status: 'success',
            message: `Welcome, ${username}!`,
          };
          ws.send(JSON.stringify(successResponse));
        } else {
          const errorResponse = {
            status: 'error',
            message: 'Invalid username or password',
          };
          ws.send(JSON.stringify(errorResponse));
        }
      } else {
        ws.send(JSON.stringify({ status: 'error', message: 'Invalid request type' }));
      }
    } catch (err) {
      console.error('Error handling message:', err);
      ws.send(JSON.stringify({ status: 'error', message: 'Invalid message format' }));
    }
  });
});

console.log('WebSocket server is listening on ws://localhost:8080');
