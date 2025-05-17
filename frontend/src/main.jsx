import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { PreferenceProvider } from './context/PreferenceContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Create React root and render the application inside it
createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* Provides user preference context (tenant or owner) to the app i use that for different views */}
        <PreferenceProvider>
            {/* Provides authentication context (login status, user info) to the app */}
            <AuthProvider>
                {/* Main application component */}
                <App />
            </AuthProvider>
        </PreferenceProvider>
    </StrictMode>
);
