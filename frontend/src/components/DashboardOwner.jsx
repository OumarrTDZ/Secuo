import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiPlus } from 'react-icons/fi';

const DashboardOwner = () => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-wrapper">
            <div className="sidebar-left">
                {/* ... sidebar content ... */}
            </div>
            
            <div className="owner-spaces-container">
                <div className="owner-header">
                    <div className="owner-title">
                        <FiHome className="title-icon" />
                        <h1>My Spaces</h1>
                    </div>
                    <button 
                        className="add-space-button"
                        onClick={() => navigate('/add-space')}
                    >
                        <FiPlus className="add-icon" />
                        <span>Add New Space</span>
                    </button>
                </div>

                {/* ...I WILL PUT HERE THE spaces list ... */}
            </div>

            <div className="sidebar-right">
                {/* ... I WILL PUT HERE THE sidebar content ... */}
            </div>
        </div>
    );
};

export default DashboardOwner; 