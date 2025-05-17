import { useNavigate } from "react-router-dom";
import '../styles/components/tenantSpaces.css';
import React from "react";

const TenantSpaces = ({ user, rentedSpaces }) => {
    const navigate = useNavigate();

    // Navigate to the detail page for the selected space
    const handleViewSpace = (spaceId) => {
        navigate(`/space/${spaceId}`);
    };

    return (
        <div className="tenant-container">
            <h3 className="tenant-title">🏡 Rented Spaces</h3>

            {rentedSpaces?.length > 0 ? (
                rentedSpaces.map((space) => (
                    <div key={space._id} className="tenant-card">
                        <div className="tenant-card-button-container">
                            <button
                                className="view-space-btn"
                                onClick={() => handleViewSpace(space._id)}
                            >
                                View Details
                            </button>
                        </div>

                        {/* Display main space info */}
                        <p className="tenant-text"><strong>{space.spaceType}</strong> - {space.description}</p>
                        <p className="tenant-subtext">Gallery: {space.gallery || " Not Available"}</p>
                        <p className="tenant-subtext">Rooms: {space.rooms || " Not Available"}</p>
                        <p className="tenant-subtext">Monthly Price: €{space.monthlyPrice || " Not Specified"}</p>
                    </div>
                ))
            ) : (
                <p className="tenant-empty"> You don't have rented spaces</p>
            )}
        </div>
    );
};

export default TenantSpaces;
