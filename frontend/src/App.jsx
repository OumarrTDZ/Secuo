import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './styles/styles.css';
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
import DashboardOwner from './pages/DashboardOwner.jsx';
import { PreferenceProvider } from './context/PreferenceContext.jsx';
import Dashboard from './pages/Dashboard';
import EditContract from "./pages/EditContract.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import CreateContract from "./pages/CreateContract.jsx";
import CreateReport from "./pages/CreateReport.jsx";

function App() {

    return (
        <Router>
            <Routes>
                // ADMIN API ROUTES
                <Route path="/admin-login" element={<AdminLogin />} /> {/* Admin login */}
                <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* Admin dashboard */}
                <Route path="/admin-validation" element={<AdminValidation />} />

                // GLOBAL API ROUTES
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                // USER API ROUTES
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/space/:spaceId" element={<SpaceDetails />} />
                <Route path="/report/:spaceId" element={<CreateReport />} />
                <Route path="/contracts/new" element={<CreateContract />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/dashboard-tenant" element={<Dashboard />} />
                <Route path="/dashboard-owner" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/create-space" element={<CreateSpace />} />
                <Route path="/edit-contract/:contractId" element={<EditContract />} />
            </Routes>
        </Router>
    );
}

export default App;
