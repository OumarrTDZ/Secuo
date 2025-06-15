import React from 'react';
import { usePreference } from '../context/PreferenceContext';
import '../styles/components/navbar.css';
import { FiHome, FiUser } from 'react-icons/fi';
import logo from '../assets/logo.png';

const Navbar = ({ user }) => {
    const { preference, togglePreference } = usePreference();

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="avatar">
                    {preference === 'OWNER' ? <FiHome /> : <FiUser />}
                </div>
                <span className="welcome">
                    {user ? `Hello ${user.firstName} ${user.lastName}` : 'Bienvenido'}
                </span>
            </div>
            <div className="navbar-right">
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={preference === 'OWNER'}
                        onChange={togglePreference}
                    />
                    <span className="slider round"></span>
                </label>
                <img src={logo} alt="Company Logo" className="logo" />
            </div>
        </nav>
    );
};

export default Navbar;
