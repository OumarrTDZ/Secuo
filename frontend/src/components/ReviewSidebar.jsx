import React from 'react';
import '../styles/components/reviewSidebar.css';
import ImageCarousel from './ImageCarousel';
import DocumentCarousel from './DocumentCarousel';

const ReviewSidebar = ({ isOpen, onClose, data, type, onValidate }) => {
    if (!data) return null;

    // Handle validation and close
    const handleValidateAndClose = async (status) => {
        try {
            await onValidate(type, data._id, status);
            onClose();
        } catch (error) {
            // If validation fails, don't close the sidebar
            console.error('Validation failed:', error);
        }
    };

    const renderUserDetails = (user) => (
        <div className="review-content">
            <h3>User Details</h3>
            <div className="review-section">
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>DNI:</strong> {user.dni}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phoneNumber}</p>
                <p><strong>Role:</strong> {user.preference}</p>
            </div>
            
            <div className="review-section">
                <h4>Documents</h4>
                {user.idFrontPhoto && user.idBackPhoto && (
                    <div className="document-section">
                        <h5>DNI Documents</h5>
                        <DocumentCarousel
                            documents={[user.idFrontPhoto, user.idBackPhoto]}
                            type="user"
                            id={user._id}
                        />
                    </div>
                )}
            </div>
        </div>
    );

    const renderSpaceDetails = (space) => (
        <div className="review-content">
            <h3>Space Details</h3>
            <div className="review-section">
                <h4>Property Information</h4>
                <p><strong>Type:</strong> {space.spaceType}</p>
                <p><strong>Description:</strong> {space.description}</p>
                <p><strong>Size:</strong> {space.squareMeters}m²</p>
                {space.rooms && <p><strong>Rooms:</strong> {space.rooms}</p>}
                {space.floor && <p><strong>Floor:</strong> {space.floor}</p>}
                {space.door && <p><strong>Door:</strong> {space.door}</p>}
            </div>

            <div className="review-section">
                <h4>Gallery</h4>
                <div className="space-gallery">
                    {space.gallery && space.gallery.length > 0 && (
                        <ImageCarousel 
                            images={space.gallery} 
                            spaceId={space._id}
                        />
                    )}
                </div>
            </div>

            {space.validationDocuments && space.validationDocuments.length > 0 && (
                <div className="review-section">
                    <h4>Validation Documents</h4>
                    <DocumentCarousel
                        documents={space.validationDocuments}
                        type="space"
                        id={space._id}
                    />
                </div>
            )}
        </div>
    );

    const renderContractDetails = (contract) => {
        // Process contract documents to ensure we have proper paths
        const processedDocuments = contract.contractDocument?.map(doc => {
            if (typeof doc === 'string') {
                return doc;
            }
            return doc.path || doc;
        }).filter(Boolean) || [];

        return (
            <div className="review-content">
                <h3>Contract Details</h3>
                <div className="review-section">
                    <h4>Contract Information</h4>
                    <p><strong>Type:</strong> {contract.contractType}</p>
                    <p><strong>Owner DNI:</strong> {contract.ownerDni}</p>
                    <p><strong>Tenant DNI:</strong> {contract.tenantDni}</p>
                    <p><strong>Start Date:</strong> {new Date(contract.startDate).toLocaleDateString()}</p>
                    {contract.endDate && (
                        <p><strong>End Date:</strong> {new Date(contract.endDate).toLocaleDateString()}</p>
                    )}
                </div>

                <div className="review-section">
                    <h4>Financial Details</h4>
                    <p><strong>Initial Payment:</strong> €{contract.initialPayment}</p>
                    {contract.monthlyPayment && (
                        <p><strong>Monthly Payment:</strong> €{contract.monthlyPayment}</p>
                    )}
                    {contract.lateFee > 0 && (
                        <p><strong>Late Fee:</strong> €{contract.lateFee}</p>
                    )}
                    <p><strong>Payment Status:</strong> {contract.paymentStatus}</p>
                </div>

                {processedDocuments.length > 0 && (
                    <div className="review-section">
                        <h4>Contract Documents</h4>
                        <DocumentCarousel
                            documents={processedDocuments}
                            type="contract"
                            id={contract._id}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className={`review-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`review-sidebar ${isOpen ? 'open' : ''}`}>
                <button className="close-button" onClick={onClose}>×</button>
                {type === 'user' && renderUserDetails(data)}
                {type === 'space' && renderSpaceDetails(data)}
                {type === 'contract' && renderContractDetails(data)}
                
                <div className="sidebar-actions">
                    <button 
                        className="approve-button"
                        onClick={() => handleValidateAndClose("APPROVED")}
                    >
                        Approve
                    </button>
                    <button 
                        className="reject-button"
                        onClick={() => handleValidateAndClose("REJECTED")}
                    >
                        Reject
                    </button>
                    <button 
                        className="cancel-button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
};

export default ReviewSidebar;