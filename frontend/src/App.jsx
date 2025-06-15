import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import './styles/styles.css';
import './styles/layouts/adminLayout.css';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from "./pages/Register.jsx";
import AdminValidation from "./pages/AdminValidation.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CreateSpace from "./pages/CreateSpace.jsx";
import DashboardTenant from './pages/DashboardTenant.jsx';
import SpaceDetails from "./pages/SpaceDetails.jsx";
import TenantSpaceDetails from "./pages/TenantSpaceDetails.jsx";
import DashboardOwner from './pages/DashboardOwner.jsx';
import { PreferenceProvider } from './context/PreferenceContext.jsx';
import Dashboard from './pages/Dashboard';
import EditContract from "./pages/EditContract.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import CreateContract from "./pages/CreateContract.jsx";
import CreateReport from "./pages/CreateReport.jsx";
import EditSpace from "./pages/EditSpace.jsx";
import Navbar from './components/Navbar';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import axios from 'axios';

// Layout for usual users
const UserLayout = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const fetchUserData = async () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.get('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(data.user);
        } catch (error) {
            console.error('Error fetching user data:', error);
            localStorage.removeItem('userToken');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [location.pathname]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="app-wrapper">
            <Navbar user={user} />
            <div className="main-wrapper">
                <SidebarLeft user={user} />
                <div className="main-content">
                    {children}
                </div>
                <SidebarRight user={user} reloadUser={fetchUserData} />
            </div>
        </div>
    );
};

// Layout for administrators
const AdminLayout = ({ children }) => {
    return <div className="admin-layout">{children}</div>;
};

function AppContent() {
    const location = useLocation();
    
    // admin routes
    const isAdminRoute = (path) => {
        return ['/admin-login', '/admin-dashboard', '/admin-validation'].includes(path);
    };

    // public routes that doesnt need layoutttt
    const isPublicRoute = (path) => {
        return ['/', '/login', '/register'].includes(path);
    };

    const getLayout = (component) => {
        if (isPublicRoute(location.pathname)) {
            return component;
        }
        if (isAdminRoute(location.pathname)) {
            return <AdminLayout>{component}</AdminLayout>;
        }
        return <UserLayout>{component}</UserLayout>;
    };

    return (
        <PreferenceProvider>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* admin routes */}
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin-dashboard" element={getLayout(<AdminDashboard />)} />
                <Route path="/admin-validation" element={getLayout(<AdminValidation />)} />

                {/* user routes */}
                <Route path="/dashboard" element={getLayout(<Dashboard />)} />
                <Route path="/dashboard-tenant" element={getLayout(<DashboardTenant />)} />
                <Route path="/dashboard-owner" element={getLayout(<DashboardOwner />)} />
                <Route path="/create-space" element={getLayout(<CreateSpace />)} />
                <Route path="/space/:id" element={getLayout(<SpaceDetails />)} />
                <Route path="/edit-space/:id" element={getLayout(<EditSpace />)} />
                <Route path="/tenant-space/:id" element={getLayout(<TenantSpaceDetails />)} />
                <Route path="/edit-contract/:id" element={getLayout(<EditContract />)} />
                <Route path="/edit-profile" element={getLayout(<EditProfile />)} />
                <Route path="/create-contract/:spaceId" element={getLayout(<CreateContract />)} />
                <Route path="/create-report/:spaceId" element={getLayout(<CreateReport />)} />
                <Route path="/chat" element={getLayout(<Chat />)} />
            </Routes>
        </PreferenceProvider>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;

