import { usePreference } from '../context/PreferenceContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardTenant from './DashboardTenant';
import DashboardOwner from './DashboardOwner';

const Dashboard = () => {
    const { preference } = usePreference();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="dashboard-content">
            {preference === 'TENANT' ? 
                <DashboardTenant /> : 
                <DashboardOwner />
            }
        </div>
    );
};

export default Dashboard;
