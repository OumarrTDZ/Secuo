import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PreferenceContext = createContext();

export const PreferenceProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [preference, setPreference] = useState(() => {
        const stored = localStorage.getItem('preference');
        return stored === 'OWNER' ? 'OWNER' : 'TENANT';
    });

    useEffect(() => {
        const syncPreference = () => {
            const updated = localStorage.getItem('preference');
            setPreference(updated === 'OWNER' ? 'OWNER' : 'TENANT');
        };
        window.addEventListener('storage', syncPreference);
        return () => window.removeEventListener('storage', syncPreference);
    }, []);

    const togglePreference = () => {
        const newPref = preference === 'TENANT' ? 'OWNER' : 'TENANT';
        localStorage.setItem('preference', newPref);
        setPreference(newPref);

        // Route redirection for full visual context change
        if (newPref === 'OWNER') {
            navigate('/dashboard-owner');
        } else {
            navigate('/dashboard-tenant');
        }
    };

    return (
        <PreferenceContext.Provider value={{ preference, setPreference, togglePreference }}>
            {children}
        </PreferenceContext.Provider>
    );
};

export const usePreference = () => useContext(PreferenceContext);
