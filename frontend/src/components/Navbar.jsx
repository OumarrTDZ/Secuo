import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreference } from '../context/PreferenceContext'; // Import context hook for user preference
import '../styles/components/navbar.css';
import { FiHome, FiUser } from 'react-icons/fi';
import logo from '../assets/logo.png';

const Navbar = ({ user }) => {
    const { preference, togglePreference } = usePreference();
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="navbar-left">
                {/* Display user initial as avatar */}
                <div className="avatar">
                    {preference === 'OWNER' ? <FiHome /> : <FiUser />}
                </div>
                {/* Welcome message with user full name if available */}
                <span className="welcome">
                    {user ? `Hola ${user.firstName} ${user.lastName}` : 'Bienvenido'}
                </span>
            </div>

            <div className="navbar-right">
                {/* Toggle switch to switch user preference between OWNER and TENANT */}
                <label className="switch">
                    <input type="checkbox" checked={preference === 'OWNER'} onChange={togglePreference} />
                    <span className="slider round"></span>
                </label>
                {/* Company logo */}
                <img src={logo} alt="Company Logo" className="logo" />
            </div>
        </nav>
    );
};

export default Navbar;
