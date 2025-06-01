import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the Preference context
const PreferenceContext = createContext();

// PreferenceProvider component to provide preference state and toggle function
export const PreferenceProvider = ({ children }) => {
    const navigate = useNavigate();
    const [preference, setPreference] = useState(() => {
        // Cargar preferencia inicial del localStorage
        const stored = localStorage.getItem('userPreference');
        return (stored === 'TENANT' || stored === 'OWNER') ? stored : 'TENANT';
    });

    // Función para cambiar la preferencia
    const togglePreference = () => {
        const newPref = preference === 'TENANT' ? 'OWNER' : 'TENANT';
        setPreference(newPref);
        localStorage.setItem('userPreference', newPref);
        
        // Redirect to the appropriate dashboard
        navigate(newPref === 'TENANT' ? '/dashboard-tenant' : '/dashboard-owner');
    };

    // Update preference when userPreference changes in localStorage
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'userPreference') {
                const stored = localStorage.getItem('userPreference');
                if (stored && (stored === 'TENANT' || stored === 'OWNER')) {
                    setPreference(stored);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Update preference when it changes in localStorage
    useEffect(() => {
        const stored = localStorage.getItem('userPreference');
        if (stored && (stored === 'TENANT' || stored === 'OWNER') && stored !== preference) {
            setPreference(stored);
        }
    }, [preference]);

    return (
        <PreferenceContext.Provider value={{ preference, setPreference, togglePreference }}>
            {children}
        </PreferenceContext.Provider>
    );
};

// Custom hook to use Preference context easily
export const usePreference = () => useContext(PreferenceContext);
