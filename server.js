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
  console.log('A client connected');
  
  // Send a message to the client upon connection
  ws.send(JSON.stringify({ status: 'info', message: 'Connected to WebSocket server' }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      // Handle login message type
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
      } 
      
      // Handle chat message type
      else if (data.type === 'chat') {
        const { username, message } = data;

        // Broadcast the chat message to all connected clients
        const chatMessage = {
          type: 'chat',
          username,
          message,
        };

        // Broadcast to all clients except the sender
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(chatMessage));
          }
        });
      } else {
        // Invalid message type
        ws.send(JSON.stringify({ status: 'error', message: 'Invalid request type' }));
      }
    } catch (err) {
      console.error('Error handling message:', err);
      ws.send(JSON.stringify({ status: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('A client disconnected');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

console.log('WebSocket server is listening on ws://localhost:8080');
