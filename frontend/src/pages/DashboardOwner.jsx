import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../components/Navbar.jsx";
import SidebarLeft from "../components/SidebarLeft.jsx";
import SidebarRight from "../components/SidebarRight.jsx";
import OwnerSpaceCard from "../components/OwnerSpaceCard.jsx";

import "../styles/pages/ownerDashboard.css";

const DashboardOwner = () => {
    const [user, setUser] = useState(null);
    const [ownedSpaces, setOwnedSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchOwnerData = async () => {
        const token = localStorage.getItem("userToken");
        if (!token) {
            alert("Access denied.");
            navigate("/login");
            return;
        }

        try {
            const { data } = await axios.get("http://localhost:5000/api/users/getOwnerDashboard", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(data.user);
            setOwnedSpaces(data.ownedSpaces || []);
        } catch (error) {
            console.error("Error loading owner data:", error);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOwnerData();
    }, []);

    const handleCreateSpace = () => {
        navigate("/create-space");
    };

    if (loading) return <p>Loading spaces...</p>;

    return (
        <div className="dashboard-wrapper">
            <SidebarLeft />
            <div className="spaces-container">
                <div className="grid">
                    {ownedSpaces.length > 0 ? (
                        ownedSpaces.map(space => (
                            <OwnerSpaceCard key={space._id} space={space} />
                        ))
                    ) : (
                        <p>You have no available spaces.</p>
                    )}
                </div>
                <button onClick={handleCreateSpace} className="add-space-button">
                    Add Space
                </button>
            </div>
            <SidebarRight user={user} reloadUser={fetchOwnerData} />
        </div>
    );
};

export default DashboardOwner;
