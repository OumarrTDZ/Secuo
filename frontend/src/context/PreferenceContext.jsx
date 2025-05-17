import { createContext, useContext, useState, useEffect } from 'react';

// Create the Preference context
const PreferenceContext = createContext();

// PreferenceProvider component to provide preference state and toggle function
export const PreferenceProvider = ({ children }) => {
    const [preference, setPreference] = useState('TENANT'); // Default preference

    useEffect(() => {
        // Load saved preference from localStorage if available
        const stored = localStorage.getItem('userPreference');
        if (stored === 'TENANT' || stored === 'OWNER') {
            setPreference(stored);
        }
    }, []);

    // Function to toggle preference between TENANT and OWNER
    const togglePreference = () => {
        const newPref = preference === 'TENANT' ? 'OWNER' : 'TENANT';
        setPreference(newPref);

        // If you want to persist preference changes later, do it elsewhere
        // localStorage.setItem('userPreference', newPref);  Not done here currently
    };

    return (
        <PreferenceContext.Provider value={{ preference, togglePreference }}>
            {children}
        </PreferenceContext.Provider>
    );
};

// Custom hook to use Preference context easily
export const usePreference = () => useContext(PreferenceContext);
