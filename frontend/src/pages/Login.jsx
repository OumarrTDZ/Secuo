import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';
import '../styles/pages/login.css';

const Login = () => {
    const [dni, setDni] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.post('http://localhost:5000/api/users/login', { dni, password });

            // This is for spaces in case it needs the same name, unify later
            localStorage.setItem('token', data.token);
            localStorage.setItem('dni', data.user.dni);

            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userPreference', data.user.preference);
            login(data);

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
                        A scalable and efficient platform for seamless rental management. Empowering landlords and tenants
                        with tools to streamline communication, handle maintenance, and manage properties effortlessly.
                    </p>
                    <p>
                        Experience simple, transparent, and effective property management.
                    </p>
                </div>

                <div className="login-right">
                    <form className="login-form" onSubmit={handleLogin}>
                        <h2 className="form-title">Login</h2>

                        <label htmlFor="dni">User DNI</label>
                        <input
                            type="text"
                            id="dni"
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                            required
                        />

                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {errorMessage && <p className="error">{errorMessage}</p>}

                        <button type="submit" className="login-button">Login</button>

                        <p className="signup-text">
                            Don’t have an account?
                            <span className="signup-link" onClick={() => navigate('/register')}> Create one here</span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
