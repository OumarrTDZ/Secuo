import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import '../styles/spaceDetails.css';
import ImageCarousel from "../components/ImageCarousel";
import { FiAlertTriangle } from 'react-icons/fi';

const TenantSpaceDetails = () => {
    const { id } = useParams();
    const [space, setSpace] = useState(null);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleReport = () => {
        navigate(`/create-report/${id}`);
    };

    useEffect(() => {
        const fetchSpaceDetails = async () => {
            try {
                console.log('Starting to fetch space details...');
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('userToken');
                if (!token) {
                    console.log('No token found');
                    setError("Please log in to view space details");
                    return;
                }
                console.log('Making API request...');
                const { data } = await api.get(`http://localhost:5000/api/spaces/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log('Received response:', data);
                if (!data.space) {
                    throw new Error('Space not found');
                }
                
                setSpace(data.space);
                // Find the contract for this tenant
                if (data.contracts && data.contracts.length > 0) {
                    const userContract = data.contracts[0]; // Assuming the first contract is the current one
                    console.log('Found user contract:', userContract);
                    setContract(userContract);
                }
            } catch (error) {
                console.error("Error fetching space details:", error);
                console.log('Error response:', error.response?.data);
                console.log('Error status:', error.response?.status);
                const errorMessage = error.response?.data?.error || error.message || "Error loading space details";
                setError(errorMessage);
                if (error.response?.status === 403) {
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                }
            } finally {
                console.log('Finished loading');
                setLoading(false);
            }
        };

        if (id) {
            console.log('Id available, starting fetch:', id);
            fetchSpaceDetails();
        }
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="loading-container">
                <p>Loading space details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={handleGoBack} className="back-button">
                    Go Back
                </button>
            </div>
        );
    }

    if (!space) {
        return (
            <div className="error-container">
                <p>Space not found</p>
                <button onClick={handleGoBack} className="back-button">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-details-container">
            <div className="space-details-header">
                <h1>{space.spaceType} Details</h1>
                <div className="space-actions">
                    <button 
                        onClick={handleReport}
                        className="edit-button"
                        title="Report an issue"
                    >
                        <FiAlertTriangle /> Report Issue
                    </button>
                </div>
            </div>

            <div className="space-details-content">
                {/* Image Gallery */}
                {space.gallery && space.gallery.length > 0 && (
                    <div className="space-gallery-container">
                        <div className="space-gallery large-gallery">
                            <ImageCarousel images={space.gallery} spaceId={space._id} />
                        </div>
                    </div>
                )}

                <div className="details-grid">
                    <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{space.spaceType}</span>
                    </div>
                    {space.marking && (
                        <div className="detail-item">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{space.marking}</span>
                        </div>
                    )}
                    {space.floor && (
                        <div className="detail-item">
                            <span className="detail-label">Floor:</span>
                            <span className="detail-value">{space.floor}</span>
                        </div>
                    )}
                    {space.door && (
                        <div className="detail-item">
                            <span className="detail-label">Door:</span>
                            <span className="detail-value">{space.door}</span>
                        </div>
                    )}
                    <div className="detail-item">
                        <span className="detail-label">Size:</span>
                        <span className="detail-value">{space.squareMeters}m²</span>
                    </div>
                    {space.rooms && (
                        <div className="detail-item">
                            <span className="detail-label">Rooms:</span>
                            <span className="detail-value">{space.rooms}</span>
                        </div>
                    )}
                    <div className="detail-item">
                        <span className="detail-label">Municipality:</span>
                        <span className="detail-value">{space.municipality}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">City:</span>
                        <span className="detail-value">{space.city}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Address:</span>
                        <span className="detail-value">{space.address}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Postal Code:</span>
                        <span className="detail-value">{space.postalCode}</span>
                    </div>
                    {space.description && (
                        <div className="detail-item full-width">
                            <span className="detail-label">Description:</span>
                            <p className="detail-value description">{space.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {contract && (
                <div className="contracts-section">
                    <div className="section-header">
                        <h2>Your Contract Details</h2>
                    </div>
                    <div className="contracts-grid">
                        <div className="contract-card">
                            <div className="contract-header">
                                <h3>{contract.contractType}</h3>
                                <span className={`status-badge ${contract.contractStatus.toLowerCase()}`}>
                                    {contract.contractStatus}
                                </span>
                            </div>
                            <div className="contract-details">
                                <p><strong>Start Date:</strong> {new Date(contract.startDate).toLocaleDateString()}</p>
                                <p><strong>End Date:</strong> {new Date(contract.endDate).toLocaleDateString()}</p>
                                <p><strong>Monthly Payment:</strong> €{contract.monthlyPayment}</p>
                                <p><strong>Payment Status:</strong> <span className={`status-badge ${contract.paymentStatus.toLowerCase()}`}>{contract.paymentStatus}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bottom-actions">
                <button onClick={handleGoBack} className="back-button-soft">
                    Back
                </button>
            </div>
        </div>
    );
};

export default TenantSpaceDetails;