import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { usePreference } from '../context/PreferenceContext';
import logo from '../assets/logo.png';
import '../styles/pages/login.css';

const Login = () => {
    const [dni, setDni] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const { setPreference } = usePreference();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.post('http://localhost:5000/api/users/login', { dni, password });

            // Store user data and token
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userPreference', data.user.preference);
            
            // Update contexts
            login(data);

            // Trigger a storage event for other components to update
            window.dispatchEvent(new Event('storage'));

            // Navigate to the appropriate dashboard
            if (data.user.preference === "TENANT") {
                navigate('/dashboard-tenant');
            } else {
                navigate('/dashboard-owner');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.error || "Login failed.");
        }
    };

    return (
        <div className="login-page">
            <nav className="login-navbar">
                <img src={logo} alt="SECUO logo" className="nav-logo" />
                <h1>SECUO Property Manager</h1>
            </nav>

            <div className="login-container">
                <div className="login-left">
                    <h2>Welcome to <span className="highlight">SECUO</span></h2>
                    <p>
                        Your comprehensive platform for property management. We streamline communication between owners and tenants,
                        making contract management and property maintenance effortless.
                    </p>
                    <p>
                        Experience modern, transparent, and efficient property management.
                    </p>
                </div>

                <div className="login-right">
                    <div className="login-form">
                        <h2 className="form-title">Login</h2>
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label htmlFor="dni">User DNI</label>
                                <input
                                    type="text"
                                    id="dni"
                                    placeholder="Enter your DNI"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {errorMessage && <p className="error">{errorMessage}</p>}

                            <button type="submit" className="login-button">Login</button>

                            <p className="signup-text">
                                Don't have an account?
                                <span className="signup-link" onClick={() => navigate('/register')}>Create one here</span>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
