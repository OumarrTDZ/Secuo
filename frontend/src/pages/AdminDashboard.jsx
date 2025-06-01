import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import { FiUserCheck, FiHome, FiLogOut } from 'react-icons/fi';

const AdminDashboard = () => {
    const navigate = useNavigate();

    // Check if the admin is authenticated on component mount
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin-login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin-login');
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">
                    <FiHome /> Admin Dashboard
                </h1>
                <div className="admin-actions">
                    <button 
                        className="admin-button primary"
                        onClick={() => navigate('/admin-validation')}
                    >
                        <FiUserCheck />
                        Data Validation
                    </button>
                    <button 
                        className="admin-button danger"
                        onClick={handleLogout}
                    >
                        <FiLogOut />
                        Log Out
                    </button>
                </div>
            </div>

            <div className="admin-grid">
                <div className="admin-card">
                    <h3>Pending Validations</h3>
                    <p>Review and validate new users, spaces, and contracts.</p>
                    <button 
                        className="admin-button primary"
                        onClick={() => navigate('/admin-validation')}
                    >
                        View Pending
                    </button>
                </div>

                <div className="admin-card">
                    <h3>System Overview</h3>
                    <p>Monitor system status and performance.</p>
                    {/* Aquí podrías agregar más funcionalidades en el futuro */}
                </div>

                <div className="admin-card">
                    <h3>Reports</h3>
                    <p>Access system reports and analytics.</p>
                    {/* Aquí podrías agregar más funcionalidades en el futuro */}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
