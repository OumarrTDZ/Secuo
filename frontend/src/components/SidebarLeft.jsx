import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from './api.js';
import socket from '../socket/socket';
import { usePreference } from '../context/PreferenceContext';
import '../styles/components/sidebarLeft.css';
//import ChatPanel from './ChatPanel';
import { 
    FiBell, 
    FiMessageCircle, 
    FiDollarSign, 
    FiCheck, 
    FiX, 
    FiFileText, 
    FiAlertTriangle, 
    FiUserCheck, 
    FiUserX, 
    FiClipboard 
} from 'react-icons/fi';

const POLLING_INTERVAL = 5000;

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const SidebarLeft = () => {
    const { preference } = usePreference();
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showReports, setShowReports] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [ownerReports, setOwnerReports] = useState([]);
    const [tenantReports, setTenantReports] = useState([]);
    const [error, setError] = useState(null);
    const [reportsError, setReportsError] = useState(null);
    
    const notificationsPanelRef = useRef(null);
    const notificationButtonRef = useRef(null);
    const chatButtonRef = useRef(null);
    const reportsPanelRef = useRef(null);
    const reportsButtonRef = useRef(null);
    const lastFetchTime = useRef(0);
    const pollingTimeoutRef = useRef(null);

    const fetchUnreadCount = useCallback(async (force = false) => {
        try {
            const now = Date.now();
            if (!force && now - lastFetchTime.current < POLLING_INTERVAL) {
                return;
            }

            const token = localStorage.getItem('userToken');
            if (!token) return;

            lastFetchTime.current = now;
            const { data } = await api.get('http://localhost:5000/api/notifications/unread', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (typeof data.count === 'number') {
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error('[Polling] Error:', error);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) return;

            const { data } = await api.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNotifications(data);
            setError(null);
        } catch (error) {
            setError('Failed to load notifications');
        }
    }, []);

    const fetchReports = useCallback(async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) return;

            const [ownerResponse, tenantResponse] = await Promise.all([
                api.get('http://localhost:5000/api/reports', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                api.get('http://localhost:5000/api/reports/my-reports', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (Array.isArray(ownerResponse.data)) {
                setOwnerReports(ownerResponse.data);
                    console.log('[OWNER REPORTS]', ownerResponse.data);
            }
            if (Array.isArray(tenantResponse.data)) {
                setTenantReports(tenantResponse.data);
                                    console.log('[OWNER REPORTS]', ownerResponse.data);

            }
            setReportsError(null);
        } catch (error) {
            console.error('Error fetching reports:', error);
            setReportsError('Error loading reports. Please try again.');
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) return;

        const handleNewNotification = () => {
            fetchUnreadCount(true);
            if (showNotifications) {
                fetchNotifications();
            }
        };

        socket.on('newNotification', handleNewNotification);
        socket.connect();

        return () => {
            socket.off('newNotification', handleNewNotification);
        };
    }, [showNotifications, fetchUnreadCount, fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showNotifications &&
                notificationsPanelRef.current &&
                !notificationsPanelRef.current.contains(event.target) &&
                !notificationButtonRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showReports &&
                reportsPanelRef.current &&
                !reportsPanelRef.current.contains(event.target) &&
                !reportsButtonRef.current.contains(event.target)) {
                setShowReports(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showReports]);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) return;

        fetchUnreadCount(true);
        
        const poll = () => {
            fetchUnreadCount();
            pollingTimeoutRef.current = setTimeout(poll, POLLING_INTERVAL);
        };
        
        poll();

        return () => {
            if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
            }
        };
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (showReports) {
            fetchReports();
        }
    }, [preference, showReports, fetchReports]);

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) return;

            await api.post('http://localhost:5000/api/notifications/mark-all-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            setError(null);
        } catch (error) {
            setError('Failed to mark notifications as read');
        }
    };

    const toggleNotifications = () => {
        if (!showNotifications) {
            fetchNotifications();
        }
        setShowNotifications(!showNotifications);
    };

    const toggleReports = () => {
        if (!showReports) {
            fetchReports();
        }
        setShowReports(!showReports);
        if (showNotifications) {
            setShowNotifications(false);
        }
    };

    const toggleChat = () => {
        setShowChat(!showChat);
        if (showNotifications) setShowNotifications(false);
        if (showReports) setShowReports(false);
    };

    // Sends a request to update the status of a report and updates the UI accordingly
    const handleStatusUpdate = async (reportId, newStatus) => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token || !reportId || !isValidObjectId(reportId)) {
                setReportsError('Invalid report ID or missing authentication');
                return;
            }

            const response = await api.patch(
                `http://localhost:5000/api/reports/${reportId}/status`,
                { status: newStatus },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                const updateReports = reports => 
                    reports.map(r => r._id === reportId ? { ...r, status: newStatus } : r);

                if (preference === 'OWNER') {
                    setOwnerReports(updateReports);
                } else {
                    setTenantReports(updateReports);
                }
                setReportsError(null);
            } else {
                setReportsError(response.data?.error || 'Error updating report status');
            }
        } catch (error) {
            console.error('Error updating report status:', error);
            setReportsError(error.response?.data?.error || 'Error updating report status');
        }
    };

    const StatusButtons = ({ currentStatus, reportId }) => {
        console.log('Rendering StatusButtons with:', { currentStatus, reportId });
        
        const statuses = [
            { value: 'PENDING', label: 'Pending' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'RESOLVED', label: 'Resolved' }
        ];

        return (
            <div className="report-status-buttons">
                {statuses.map(status => {
                    const isActive = currentStatus === status.value;
                    console.log(`Button ${status.value}:`, { isActive, currentStatus });
                    
                    return (
                        <button
                            key={status.value}
                            data-status={status.value}
                            className={`status-button ${isActive ? 'active' : ''}`}
                            onClick={() => handleStatusUpdate(reportId, status.value)}
                        >
                            {status.label}
                        </button>
                    );
                })}
            </div>
        );
    };

    // Returns the corresponding icon component for a given notification type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'SPACE_APPROVED': return <FiCheck className="notification-type-icon" />;
            case 'SPACE_REJECTED': return <FiX className="notification-type-icon" />;
            case 'CONTRACT_APPROVED': return <FiFileText className="notification-type-icon" />;
            case 'CONTRACT_REJECTED': return <FiFileText className="notification-type-icon rejected" />;
            case 'NEW_MESSAGE': return <FiMessageCircle className="notification-type-icon" />;
            case 'PAYMENT_RECEIVED': return <FiDollarSign className="notification-type-icon" />;
            case 'PAYMENT_DUE': return <FiAlertTriangle className="notification-type-icon" />;
            case 'USER_APPROVED': return <FiUserCheck className="notification-type-icon" />;
            case 'USER_REJECTED': return <FiUserX className="notification-type-icon" />;
            case 'NEW_REPORT': return <FiClipboard className="notification-type-icon" />;
            default: return <FiBell className="notification-type-icon" />;
        }
    };

    // Returns a CSS class name based on the priority level (e.g., HIGH, MEDIUM, LOW)
    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'HIGH': return 'priority-high';
            case 'MEDIUM': return 'priority-medium';
            case 'LOW': return 'priority-low';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="sidebar-left">
            <div className="menu-items">
                <div className="menu-item">
                    <button 
                        ref={notificationButtonRef}
                        className="icon-button"
                        onClick={toggleNotifications}
                    >
                        <FiBell />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>
                </div>

                <div className="menu-item">
                    <button
                        ref={reportsButtonRef}
                        className="icon-button"
                        onClick={toggleReports}
                    >
                        <FiClipboard />
                    </button>
                </div>

 <div className="menu-item">
                    <button
                        ref={chatButtonRef}
                        className="icon-button blocked"
                        onClick={toggleChat}
                        disabled
                        title="Próximamente"
                    >
                        <FiMessageCircle />
                    </button>
                </div>

                <div className="menu-item">
                    <button
                        className="icon-button blocked"
                        disabled
                        title="Próximamente"
                    >
                        <FiDollarSign />
                    </button>
                </div>
            </div>

            {showNotifications && (
                <>
                    <div className="notifications-overlay" onClick={() => setShowNotifications(false)} />
                    <div className="notifications-panel" ref={notificationsPanelRef}>
                        <div className="notifications-header">
                            <h3>Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead}>Mark all as read</button>
                            )}
                        </div>
                        {error && (
                            <div className="notification-error">
                                {error}
                                <button onClick={fetchNotifications}>Retry</button>
                            </div>
                        )}
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
                </>
            )}

            {showChat && (
                <ChatPanel isOpen={showChat} onClose={() => setShowChat(false)} />
            )}

            {showReports && (
                <>
                    <div className="notifications-overlay" onClick={() => setShowReports(false)} />
                    <div className="reports-panel" ref={reportsPanelRef}>
                        <div className="notifications-header">
                            <h3>
                                {preference === 'OWNER' 
                                    ? 'Received Reports' 
                                    : 'Sent Reports'}
                            </h3>
                            <button onClick={fetchReports}>Update</button>
                        </div>
                        {reportsError && (
                            <div className="notification-error">
                                {reportsError}
                                <button onClick={fetchReports}>Retry</button>
                            </div>
                        )}
                        <div className="reports-list">
                            {(preference === 'OWNER' ? ownerReports : tenantReports).length > 0 ? (
                                (preference === 'OWNER' ? ownerReports : tenantReports).map(report => (
                                    <div key={report._id} className="report-item">
                                        <div className={`report-priority ${getPriorityClass(report.priority)}`}>
                                            {report.priority}
                                        </div>
                                        <div className="report-content">
                                            <h4>{report.issueType}</h4>
                                            {report.spaceId && (
                                                <div className="report-space-info">
                                                    <span className="space-label">Space:</span>
                                                    <span className="space-value">
                                                        {report.spaceId.spaceType} - {report.spaceId.address}
                                                    </span>
                                                </div>
                                            )}
                                            <p>{report.description}</p>
                                            {report.attachments && report.attachments.length > 0 && (
                                                <div className="report-thumbnails">
                                                    {report.attachments.map((attachment, index) => (
                                                        <img
                                                            key={index}
                                                            src={`http://localhost:5000${attachment}`}
                                                            alt={`Image ${index + 1}`}
                                                            onClick={() => window.open(`http://localhost:5000${attachment}`, '_blank')}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            <small>
                                                {preference === 'OWNER' 
                                                    ? `Received on: ${formatDate(report.createdAt)}`
                                                    : `Sent on: ${formatDate(report.createdAt)}`
                                                }
                                            </small>
                                            <StatusButtons 
                                                currentStatus={report.status} 
                                                reportId={report._id}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-reports">
                                    {preference === 'OWNER' 
                                        ? 'No reports received for your properties' 
                                        : 'You have not sent any reports'}
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SidebarLeft;
