import { useNavigate } from "react-router-dom";
import '../styles/components/tenantSpaces.css';
import React from "react";
import ImageCarousel from "./ImageCarousel";
import { 
    FiEye, 
    FiAlertTriangle, 
    FiHome,
    FiDollarSign,
    FiLayout
} from 'react-icons/fi';

const TenantSpaces = ({ user, rentedSpaces = [] }) => {
    const navigate = useNavigate();

    // Navigate to the tenant-specific detail page for the selected space
    const handleViewSpace = (spaceId) => {
        navigate(`/tenant-space/${spaceId}`);
    };

    const handleReportSpace = (spaceId) => {
        navigate(`/create-report/${spaceId}`);
    };

    return (
        <div className="tenant-container">
            <h3 className="tenant-title"><FiHome className="title-icon" /> Rented Spaces</h3>

            {Array.isArray(rentedSpaces) && rentedSpaces.length > 0 ? (
                rentedSpaces.map((space) => {
                    // Skip rendering if space is null or undefined
                    if (!space) return null;

                    return (
                        <div key={space._id} className="tenant-card">
                            <div className="tenant-card-button-container">
                                <button
                                    className="view-space-btn"
                                    onClick={() => handleViewSpace(space._id)}
                                    aria-label="View space details"
                                >
                                    <FiEye />
                                </button>
                                <button
                                    className="report-space-btn"
                                    onClick={() => handleReportSpace(space._id)}
                                    aria-label="Report an issue"
                                >
                                    <FiAlertTriangle />
                                </button>
                            </div>

                            {/* Image Gallery */}
                            <div className="carousel-container">
                                <ImageCarousel 
                                    images={space?.gallery || []} 
                                    spaceId={space._id}
                                />
                            </div>

                            {/* Display main space info */}
                            <p className="tenant-text">
                                <FiHome className="info-icon" />
                                <strong>{space.spaceType || 'Unknown Type'}</strong> - {space.description || 'No description available'}
                            </p>
                            <p className="tenant-subtext">
                                <FiLayout className="info-icon" />
                                Rooms: {space.rooms || "Not Available"}
                            </p>
                            <p className="tenant-subtext">
                                <FiDollarSign className="info-icon" />
                                Monthly Price: €{space.monthlyPrice || "Not Specified"}
                            </p>
                        </div>
                    );
                })
            ) : (
                <p className="tenant-empty">You don't have rented spaces</p>
            )}
        </div>
    );
};

export default TenantSpaces;
