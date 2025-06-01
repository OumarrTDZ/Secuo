import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import '../styles/styles.css';
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
                const { data } = await axios.get(`http://localhost:5000/api/spaces/${id}`, {
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
        <div className="container">
            <div className="space-details">
                <div className="space-header">
                    <h2>{space.spaceType} Details</h2>
                    <button 
                        onClick={handleReport}
                        className="report-button"
                        title="Report an issue"
                    >
                        <FiAlertTriangle /> Report Issue
                    </button>
                </div>
                
                {/* Image Gallery */}
                {space.gallery && space.gallery.length > 0 && (
                    <div className="space-gallery">
                        <ImageCarousel images={space.gallery} spaceId={space._id} />
                    </div>
                )}

                <div className="details-grid">
                    <div className="detail-item">
                        <strong>Type:</strong> {space.spaceType}
                    </div>
                    {space.marking && (
                        <div className="detail-item">
                            <strong>Name:</strong> {space.marking}
                        </div>
                    )}
                    {space.floor && (
                        <div className="detail-item">
                            <strong>Floor:</strong> {space.floor}
                        </div>
                    )}
                    {space.door && (
                        <div className="detail-item">
                            <strong>Door:</strong> {space.door}
                        </div>
                    )}
                    <div className="detail-item">
                        <strong>Size:</strong> {space.squareMeters}m²
                    </div>
                    {space.rooms && (
                        <div className="detail-item">
                            <strong>Rooms:</strong> {space.rooms}
                        </div>
                    )}
                    <div className="detail-item">
                        <strong>Monthly Price:</strong> €{space.monthlyPrice}
                    </div>
                    {space.description && (
                        <div className="detail-item full-width">
                            <strong>Description:</strong>
                            <p>{space.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {contract && (
                <div className="contract-section">
                    <h2>Your Contract Details</h2>
                    <div className="contract-details">
                        <div className="detail-item">
                            <strong>Contract Type:</strong> {contract.contractType}
                        </div>
                        <div className="detail-item">
                            <strong>Start Date:</strong> {new Date(contract.startDate).toLocaleDateString()}
                        </div>
                        <div className="detail-item">
                            <strong>End Date:</strong> {new Date(contract.endDate).toLocaleDateString()}
                        </div>
                        <div className="detail-item">
                            <strong>Monthly Payment:</strong> €{contract.monthlyPayment}
                        </div>
                        <div className="detail-item">
                            <strong>Payment Status:</strong> 
                            <span className={`status ${contract.paymentStatus.toLowerCase()}`}>
                                {contract.paymentStatus}
                            </span>
                        </div>
                        <div className="detail-item">
                            <strong>Contract Status:</strong> 
                            <span className={`status ${contract.contractStatus.toLowerCase()}`}>
                                {contract.contractStatus}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <button onClick={handleGoBack} className="back-button">
                Go Back
            </button>
        </div>
    );
};

export default TenantSpaceDetails; 