import { io } from 'socket.io-client';

// Connect to the backend
const socket = io('http://localhost:5000', {
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 2000
});

export default socket;
