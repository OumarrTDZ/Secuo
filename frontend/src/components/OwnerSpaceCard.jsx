import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ImageCarousel from "./ImageCarousel";
import "../styles/components/ownerSpaceCard.css";
import "../styles/components/imageCarousel.css";
import { FiEye, FiEdit2, FiHome, FiSquare, FiMapPin, FiFileText, FiMap, FiTrash2, FiTag } from 'react-icons/fi';

const OwnerSpaceCard = ({ space, onDelete }) => {
    const navigate = useNavigate();
    
    // Detailed debug log to check all space data
    console.log('Space data:', {
        id: space._id,
        type: space.spaceType,
        location: {
            municipality: space.municipality,
            city: space.city,
            address: space.address,
            postalCode: space.postalCode
        },
        details: {
            squareMeters: space.squareMeters,
            rooms: space.rooms,
            floor: space.floor,
            door: space.door,
            marking: space.marking
        },
        status: space.status,
        validation: space.validationStatus,
        earnings: space.monthlyEarnings,
        contracts: space.contracts,
        description: space.description,
        gallery: space.gallery
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

    const handleDeleteSpace = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este espacio? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            await api.delete(`/api/spaces/${space._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (onDelete) {
                onDelete(space._id);
            }
        } catch (error) {
            console.error('Error deleting space:', error);
            alert(error.response?.data?.error || 'Error al eliminar el espacio');
        }
    };

    // debug logggs
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
                <button 
                    className="delete-space-btn"
                    onClick={handleDeleteSpace}
                    aria-label="Delete space"
                >
                    <FiTrash2 />
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
                            <FiTag className="icon" />
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
                        <span className="price-value">€{space.monthlyEarnings}</span>
                        <span className="price-label">/month earnings</span>
                    </div>
                </div>

                <div className="space-meta">
                    <div className="meta-item">
                        <FiMap className="icon" />
                        <span>Municipality</span>
                        <span className="item-value">{space.municipality}, {space.city}</span>
                    </div>
                    <div className="meta-item">
                        <FiMapPin className="icon" />
                        <span>Address</span>
                        <span className="item-value">{space.address}</span>
                    </div>
                    <div className="meta-item">
                        <span>Status</span>
                        <span className={`item-value status-${space.status.toLowerCase()}`}>{space.status}</span>
                    </div>
                    <div className="meta-item">
                        <span>Validation</span>
                        <span className={`item-value validation-${space.validationStatus.toLowerCase()}`}>{space.validationStatus}</span>
                    </div>
                    <div className="meta-item">
                        <FiFileText className="icon" />
                        <span>Contracts History</span>
                        <span className="item-value">{space.contracts || 0} contract{space.contracts !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="meta-item">
                        <span>Reference ID</span>
                        <span className="item-value id">{space._id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerSpaceCard;

