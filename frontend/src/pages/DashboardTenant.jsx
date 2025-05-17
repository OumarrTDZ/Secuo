import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../components/Navbar.jsx";
import SidebarLeft from "../components/SidebarLeft.jsx";
import SidebarRight from "../components/SidebarRight.jsx";
import TenantSpaces from "../components/TenantSpaces.jsx";

const DashboardTenant = () => {
    const [user, setUser] = useState(null);
    const [rentedSpaces, setRentedSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    //  fetchTenantData outside useEffect
    const fetchTenantData = async () => {
        const token = localStorage.getItem("userToken");
        if (!token) {
            alert("Access denied.");
            navigate("/login");
            return;
        }

        try {
            const { data } = await axios.get("http://localhost:5000/api/users/getTenantDashboard", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(data.user);
            setRentedSpaces(data.rentedSpaces || []);
        } catch (error) {
            console.error("Error loading tenant data:", error);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    //  Call on mount
    useEffect(() => {
        fetchTenantData();
    }, [navigate]);

    if (loading) return <p>Loading spaces...</p>;

    return (
        <div className="dashboard-wrapper">
            <SidebarLeft />
            <div className="spaces-container">
                <TenantSpaces user={user} rentedSpaces={rentedSpaces} />
            </div>
            {/*  Now fetchTenantData is accessible */}
            <SidebarRight user={user} reloadUser={fetchTenantData} />
        </div>
    );
};

export default DashboardTenant;
