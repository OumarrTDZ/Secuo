import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api";
import "../styles/pages/adminLogin.css";
import logo from '../assets/logo.png';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    // Update form data state on input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission for admin login
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post('/api/admins/login', formData);
            localStorage.setItem('adminToken', response.data.token);
            navigate('/admin-dashboard');
        } catch (error) {
            alert("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="admin-login-page">
            <nav className="admin-navbar">
                <img src={logo} alt="SECUO logo" className="nav-logo" />
                <h1>SECUO Admin Panel</h1>
            </nav>

            <div className="admin-login-container">
                <div className="admin-login-left">
                    <h2>Administrator Access</h2>
                    <p>
                        Welcome to the SECUO administrative panel. This area is restricted to authorized personnel only.
                        Please log in with your administrator credentials to access the system.
                    </p>
                    <p>
                        From here you can manage user validations, review property listings, and oversee platform operations.
                    </p>
                </div>

                <div className="admin-login-right">
                    <div className="admin-login-form">
                        <h2 className="form-title">Admin Login</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="admin-login-button">Log In</button>
                        </form>
                        <button onClick={() => navigate('/')} className="back-button">
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

