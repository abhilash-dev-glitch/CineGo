const { WebSocketServer } = require('ws');
const cookie = require('cookie'); // Import the cookie parsing library
const { verifyToken } = require('./jwt');
const User = require('../models/User');

let wss;

const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', async (ws, req) => {
    let token;
    
    // 1. Try to parse token from cookie
    if (req.headers.cookie) {
      const cookies = cookie.parse(req.headers.cookie);
      token = cookies.token;
    }

    // 2. If no cookie, try to get from query param (for testing/flexibility)
    if (!token) {
      const url = new URL(req.url, `http://${req.headers.host}`);
      token = url.searchParams.get('token');
    }
    
    if (!token) {
      console.log('WebSocket: Connection rejected (no token provided)');
      ws.terminate();
      return;
    }

    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      // Allow admins and theater managers to connect
      if (!user || (user.role !== 'admin' && user.role !== 'theater_manager')) {
        console.log('WebSocket: Connection rejected (invalid user or unauthorized role)');
        ws.terminate();
        return;
      }

      console.log(`WebSocket: ${user.role} client connected (${user.name})`);
      ws.isAlive = true;
      ws.role = user.role;
      ws.userId = user._id.toString();

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (message) => {
        console.log('WebSocket: Received message:', message.toString());
      });

      ws.on('close', () => {
        console.log(`WebSocket: ${user.role} client disconnected`);
      });

      ws.on('error', (error) => {
        console.error('WebSocket Error:', error);
      });
    } catch (err) {
      console.log('WebSocket: Connection rejected (invalid token)');
      ws.terminate();
    }
  });

  // Keep-alive pinger
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('✅ WebSocket server initialized');
};

/**
 * Broadcasts a message to all connected admin and manager clients.
 * @param {object} data The data to send (will be JSON.stringified)
 */
const broadcast = (data) => {
  if (!wss) {
    console.warn('WebSocket server not initialized, cannot broadcast.');
    return;
  }

  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if ((client.role === 'admin' || client.role === 'theater_manager') && client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};

module.exports = {
  initWebSocket,
  broadcast,
};