import React, { createContext, useState, useEffect } from 'react';

// Create the authentication context
export const AuthContext = createContext();

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // State to store the authenticated user
    const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
            // Here you could fetch the user from backend if needed
            // setUser(fetchUserFromToken(token));
        }
    }, []);

    // Function to log in the user
    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', userData.token); // Save token to localStorage
    };

    // Function to log out the user
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken'); // Remove token from localStorage
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
