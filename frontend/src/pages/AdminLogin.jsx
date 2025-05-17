import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/pages/adminLogin.css"

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
            const response = await axios.post('http://localhost:5000/api/admins/login', formData);
            localStorage.setItem('adminToken', response.data.token);
            alert("Login successful.");
            navigate('/admin-dashboard');
        } catch (error) {
            alert("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="login-container">
            <h2>Admin Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                />
                <button type="submit">Log In</button>
            </form>
            <button onClick={() => navigate('/')}>
                Back to Init
            </button>

        </div>
    );
};

export default AdminLogin;
