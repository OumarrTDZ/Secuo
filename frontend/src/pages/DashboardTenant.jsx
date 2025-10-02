import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "api";
import TenantSpaces from "../components/TenantSpaces.jsx";

const DashboardTenant = () => {
    const [user, setUser] = useState(null);
    const [rentedSpaces, setRentedSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchTenantData = async () => {
        const token = localStorage.getItem("userToken");
        if (!token) {
            setError("Access denied. Please log in.");
            navigate("/login");
            return;
        }

        try {
            const { data } = await api.get("http://localhost:5000/api/users/getTenantDashboard", {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            // Ensure user and rentedSpaces are properly set
            setUser(data.user || null);
            setRentedSpaces(Array.isArray(data.rentedSpaces) ? data.rentedSpaces : []);
            setError(null);
        } catch (error) {
            console.error("Error loading tenant data:", error);
            setError(error.response?.data?.message || "Error loading tenant data");
            setRentedSpaces([]);
            if (error.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenantData();
    }, [navigate]);

    if (loading) return <div className="loading-message">Loading spaces...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="spaces-container">
            <TenantSpaces user={user} rentedSpaces={rentedSpaces} />
        </div>
    );
};

export default DashboardTenant;
