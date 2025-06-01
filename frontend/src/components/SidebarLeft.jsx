import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket/socket';
import '../styles/components/sidebarLeft.css';
import { FiBell, FiMessageCircle, FiDollarSign, FiCheck, FiX, FiFileText, FiAlertTriangle, FiUserCheck, FiUserX } from 'react-icons/fi';

const SidebarLeft = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const user = JSON.parse(localStorage.getItem('user'));

        if (token && user) {
            // Join notification room
            socket.emit('joinNotifications', user.dni);

            // Listen for new notifications
            socket.on('newNotification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            // Fetch initial notifications
            fetchNotifications();
            fetchUnreadCount();
        }

        return () => {
            socket.off('newNotification');
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const { data } = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const { data } = await axios.get('http://localhost:5000/api/notifications/unread', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('userToken');
            await axios.post('http://localhost:5000/api/notifications/mark-all-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'SPACE_APPROVED':
                return <FiCheck className="notification-type-icon" />;
            case 'SPACE_REJECTED':
                return <FiX className="notification-type-icon" />;
            case 'CONTRACT_APPROVED':
                return <FiFileText className="notification-type-icon" />;
            case 'CONTRACT_REJECTED':
                return <FiFileText className="notification-type-icon rejected" />;
            case 'NEW_MESSAGE':
                return <FiMessageCircle className="notification-type-icon" />;
            case 'PAYMENT_RECEIVED':
                return <FiDollarSign className="notification-type-icon" />;
            case 'PAYMENT_DUE':
                return <FiAlertTriangle className="notification-type-icon" />;
            case 'USER_APPROVED':
                return <FiUserCheck className="notification-type-icon" />;
            case 'USER_REJECTED':
                return <FiUserX className="notification-type-icon" />;
            default:
                return <FiBell className="notification-type-icon" />;
        }
    };

    return (
        <div className="sidebar-left">
            <div className="menu-items">
                {/* Notifications */}
                <div className="menu-item">
                    <button 
                        className="icon-button"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <FiBell />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>
                </div>

                {/* Chat */}
                <div className="menu-item">
                    <Link to="/chats" className="icon-button">
                        <FiMessageCircle />
                    </Link>
                </div>

                {/* Payments */}
                <div className="menu-item">
                    <Link to="/payments" className="icon-button">
                        <FiDollarSign />
                    </Link>
                </div>
            </div>

            {/* Notifications Panel */}
            {showNotifications && (
                <div className="notifications-panel">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead}>Mark all as read</button>
                        )}
                    </div>
                    <div className="notifications-list">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div 
                                    key={notification._id} 
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                >
                                    <span className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className="notification-content">
                                        <h4>{notification.title}</h4>
                                        <p>{notification.message}</p>
                                        <small>{new Date(notification.createdAt).toLocaleString()}</small>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-notifications">No notifications</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SidebarLeft;
