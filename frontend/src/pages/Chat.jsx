import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import socket from '../socket/socket';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        // Listen for incoming messages
        socket.on('receiveMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Cleanup event listener on unmount
        return () => {
            socket.off('receiveMessage');
        };
    }, []);

    const sendMessage = () => {
        if (newMessage.trim() !== '') {
            const messageData = {
                conversationId: '681943e618aa0602fd60e0b1', // Chat ID
                senderDni: 'Y0718825C', // User DNI
                message: newMessage,
                status: 'SENT'
            };

            socket.emit('sendMessage', messageData);
            setNewMessage('');
        }
    };

    return (
        <div>
            <h2>Chat</h2>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}><strong>{msg.senderDni}:</strong> {msg.message}</p>
                ))}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>

            <nav>
                <Link to="/">
                    <p>Go to Home</p>
                </Link>
                <Link to="/chat">
                    <p>Go to Chat</p>
                </Link>
            </nav>
        </div>
    );
};

export default Chat;
