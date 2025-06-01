import React from "react";
import { useNavigate } from "react-router-dom";
import ImageCarousel from "./ImageCarousel";
import "../styles/components/ownerSpaceCard.css";
import "../styles/components/imageCarousel.css";
import { FiEye, FiEdit2, FiHome, FiSquare, FiMapPin, FiFileText } from 'react-icons/fi';

const OwnerSpaceCard = ({ space }) => {
    const navigate = useNavigate();
    
    // Debug log to check space object
    console.log('Space data for contracts:', {
        id: space._id,
        contracts: space.contracts,
        contractsLength: space.contracts?.length
    });

    const getStatusClass = (status) => {
        if (status === 'APPROVED') return 'approved';
        if (status === 'REJECTED') return 'rejected';
        return 'pending';
    };

    // Navigate to detailed view of the space
    const handleViewSpace = (spaceId) => {
        navigate(`/space/${spaceId}`);
    };

    // Navigate to edit view of the space
    const handleEditSpace = (spaceId) => {
        navigate(`/edit-space/${spaceId}`);
    };

    // Log para depuración
    console.log('Space data:', {
        id: space._id,
        gallery: space.gallery,
        validationStatus: space.validationStatus
    });

    return (
        <div className={`owner-space-card ${getStatusClass(space.validationStatus)}`}>
            {/* Buttons container */}
            <div className="space-actions">
                <button 
                    className="view-space-btn"
                    onClick={() => handleViewSpace(space._id)}
                    aria-label="View space details"
                >
                    <FiEye />
                </button>
                <button 
                    className="edit-space-btn"
                    onClick={() => handleEditSpace(space._id)}
                    aria-label="Edit space"
                >
                    <FiEdit2 />
                </button>
            </div>

            {/* Image Carousel */}
            <div className="carousel-container">
                <ImageCarousel 
                    images={Array.isArray(space.gallery) ? space.gallery : []} 
                    spaceId={space._id}
                />
            </div>

            {/* Space details */}
            <div className="space-details">
                <div className="space-header">
                    <div className="space-type">
                        <FiHome className="icon" />
                        <h2>{space.spaceType}</h2>
                    </div>
                    {space.marking && (
                        <div className="space-name">
                            <FiMapPin className="icon" />
                            <span>{space.marking}</span>
                        </div>
                    )}
                </div>

                <div className="space-info">
                    {space.squareMeters && (
                        <div className="info-item">
                            <FiSquare className="icon" />
                            <span>{space.squareMeters} m²</span>
                        </div>
                    )}
                    <div className="space-price">
                        <span className="price-value">€{space.monthlyPrice}</span>
                        <span className="price-label">/month</span>
                    </div>
                </div>

                <div className="space-status">
                    <div className="status-item">
                        <span className="status-label">Status</span>
                        <span className={`status-value ${space.status.toLowerCase()}`}>
                            {space.status}
                        </span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Validation</span>
                        <span className={`validation-status ${space.validationStatus.toLowerCase()}`}>
                            {space.validationStatus}
                        </span>
                    </div>
                </div>

                <div className="space-meta">
                    <div className="contracts-info">
                        <div className="meta-label">
                            <FiFileText className="icon" /> Contracts History
                        </div>
                        <span className="meta-value contracts-count">
                            {space.contracts || 0} contract{space.contracts !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="space-id">
                        <span className="meta-label">Reference ID</span>
                        <span className="meta-value id">{space._id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerSpaceCard;
