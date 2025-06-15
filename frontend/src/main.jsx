import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// crreatingg react root and render the application inside it
createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* Provides authentication context (login status, user info) to the app */}
        <AuthProvider>
            {/* Main application component */}
            <App />
        </AuthProvider>
    </StrictMode>
);
