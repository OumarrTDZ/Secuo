import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/ownerSpaceCard.css"

const OwnerSpaceCard = ({ space }) => {
    // Determine CSS class based on validation status
    const navigate = useNavigate();
    const getStatusClass = (status) => {
        if (status === 'APPROVED') return 'approved';
        if (status === 'REJECTED') return 'rejected';
        return 'pending';
    };

    // Navigate to detailed view of the space
    const handleViewSpace = (spaceId) => {
        navigate(`/space/${spaceId}`);
    };

    return (
        <div className={`owner-space-card ${getStatusClass(space.validationStatus)}`}>
            {/* Button to view space details */}
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <button className="view-space-btn" onClick={() => handleViewSpace(space._id)}>
                    View details
                </button>
            </div>

            {/* Space details */}
            <h2 className="text-xl font-semibold">{space.spaceType}</h2>
            <p className="text-gray-600">{space.description}</p>
            <p className="text-gray-600">ID: {space._id}</p>
            <p className="text-sm mt-2">
                Price: <strong>€{space.monthlyPrice}</strong>
            </p>
            <p className="text-sm">Status: {space.status}</p>
            <p className="tenant-subtext">Tenant DNI: {space.tenantDni || "Not specified"}</p>
            <p className="validation-status">Validation: {space.validationStatus}</p>
        </div>
    );
};

export default OwnerSpaceCard;
