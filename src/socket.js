import { io } from 'socket.io-client';

// Use environment variable for Socket URL, fallback to localhost for development
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

/** Base URL of the backend (for health checks) */
export const getBackendUrl = () => SOCKET_URL;

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    console.log('Creating new socket connection to:', SOCKET_URL);
    
    // Force polling transport and add explicit connection timeout
    socket = io(SOCKET_URL, {
      transports: ['polling'],  // Force polling only initially
      timeout: 5000,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected successfully! ID:', socket.id);
      console.log('Transport:', socket.io.engine.transport.name);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      console.error('Error message:', error.message);
      console.error('Error type:', error.type);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected. Reason:', reason);
    });
    
    socket.on('connect_timeout', () => {
      console.error('❌ Connection timeout!');
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket() first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
