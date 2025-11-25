import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import OwnerSpaceCard from "../components/OwnerSpaceCard.jsx";
import "../styles/pages/ownerDashboard.css";
import { FiPlus, FiHome } from 'react-icons/fi';

const DashboardOwner = () => {
    const [user, setUser] = useState(null);
    const [ownedSpaces, setOwnedSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchOwnerData = async () => {
        const token = localStorage.getItem("userToken");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const { data } = await api.get("/api/users/getOwnerDashboard", {
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

    const handleSpaceDeleted = (deletedSpaceId) => {
        setOwnedSpaces(prevSpaces => prevSpaces.filter(space => space._id !== deletedSpaceId));
    };

    if (loading) return <p>Loading spaces...</p>;

    return (
        <div className="spaces-container">
            <div className="owner-header">
                <h3 className="owner-title">
                    <FiHome className="title-icon" /> My Spaces
                </h3>
                <button 
                    className="add-space-button"
                    onClick={() => navigate("/create-space")}
                    aria-label="Add new space"
                >
                    <FiPlus className="add-icon" />
                    Add New Space
                </button>
            </div>

            <div className="grid">
                {ownedSpaces.length > 0 ? (
                    ownedSpaces.map(space => (
                        <OwnerSpaceCard 
                            key={space._id} 
                            space={space} 
                            onDelete={handleSpaceDeleted}
                        />
                    ))
                ) : (
                    <div className="no-spaces-message">
                        <FiHome className="no-spaces-icon" />
                        <h3>No Spaces Available</h3>
                        <p>Start by adding your first rental space!</p>
                        <button 
                            className="add-first-space-button"
                            onClick={() => navigate("/create-space")}
                        >
                            <FiPlus className="add-icon" />
                            Add Your First Space
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardOwner;

