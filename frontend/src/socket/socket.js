import { io } from 'socket.io-client';

// Socket instance holder
let socket = null;

// Initialize socket connection with current auth data
const initializeSocket = () => {
    const token = localStorage.getItem('userToken');
    const user = JSON.parse(localStorage.getItem('user'));

    // Skip connection if auth data is missing
    if (!token || !user) {
        console.log('[Socket] No auth data available, skipping connection');
        return null;
    }

    console.log('[Socket] Initializing with:', { hasToken: !!token, hasUser: !!user });

    // Configure socket connection options
    const newSocket = io('http://localhost:5000', {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: false,
        auth: {
            token,
            dni: user?.dni
        }
    });

    // Handle connection errors and events
    newSocket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error);
    });

    newSocket.on('connect_timeout', () => {
        console.error('[Socket] Connection timeout');
    });

    newSocket.on('error', (error) => {
        console.error('[Socket] Socket error:', error);
    });

    newSocket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
    });

    newSocket.on('reconnect', (attemptNumber) => {
        console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
    });

    newSocket.on('reconnect_error', (error) => {
        console.error('[Socket] Reconnection error:', error);
    });

    // Event triggered when successfully joined notification room
    newSocket.on('joinedNotifications', (data) => {
        console.log('[Socket] Successfully joined notifications room:', data);
    });

    // When connected, join user-specific notification room
    newSocket.on('connect', () => {
        console.log('[Socket] Connected successfully');
        if (user?.dni) {
            console.log('[Socket] Joining notification room for:', user.dni);
            newSocket.emit('joinNotifications', { dni: user.dni, token });
        } else {
            console.warn('[Socket] No user DNI available for notifications');
        }
    });

    return newSocket;
};

// Disconnect and reconnect with updated auth data
export const updateSocketAuth = () => {
    console.log('[Socket] Updating auth...');

    if (socket) {
        console.log('[Socket] Disconnecting existing socket...');
        socket.disconnect();
    }

    socket = initializeSocket();

    if (socket) {
        console.log('[Socket] Connecting with new auth...');
        socket.connect();
    }
};

// Initialize socket when module is loaded
socket = initializeSocket();

// Listen for localStorage changes to update socket when auth info changes
window.addEventListener('storage', (event) => {
    if (event.key === 'userToken' || event.key === 'user') {
        console.log('[Socket] Storage changed, updating auth...');
        updateSocketAuth();
    }
});

// Export a consistent interface for socket usage
const socketInterface = {
    connect: () => {
        if (!socket) {
            socket = initializeSocket();
        }
        if (socket) {
            socket.connect();
        }
    },
    disconnect: () => {
        if (socket) {
            socket.disconnect();
        }
    },
    emit: (...args) => {
        if (socket) {
            socket.emit(...args);
        }
    },
    on: (event, callback) => {
        if (socket) {
            socket.on(event, callback);
        }
    },
    off: (event, callback) => {
        if (socket) {
            socket.off(event, callback);
        }
    }
};

export default socketInterface;
