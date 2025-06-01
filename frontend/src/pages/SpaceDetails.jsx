import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import '../styles/styles.css';
import ImageCarousel from "../components/ImageCarousel";
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';

const SpaceDetails = () => {
    const { id } = useParams();
    const [space, setSpace] = useState(null);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleGoToDashboard = () => {
        navigate('/dashboard-owner');
    };

    const handleDeleteContract = async (contractId) => {
        if (!window.confirm('Are you sure you want to delete this contract?')) {
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            await axios.delete(`http://localhost:5000/api/contracts/${contractId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update the contracts list after deletion
            setContracts(contracts.filter(contract => contract._id !== contractId));
        } catch (error) {
            console.error("Error deleting contract:", error);
            alert(error.response?.data?.message || "Error deleting contract");
        }
    };

    useEffect(() => {
        const fetchSpaceDetails = async () => {
            try {
                console.log('1. Iniciando fetchSpaceDetails...');
                setLoading(true);
                setError(null);
                console.log('2. Haciendo petición a la API para id:', id);
                const { data } = await axios.get(`http://localhost:5000/api/spaces/${id}`);
                
                console.log('3. Respuesta recibida:', data);
                
                if (!data.space) {
                    console.log('4. No se encontró el espacio en la respuesta');
                    throw new Error('Space not found');
                }
                
                console.log('5. Guardando datos del espacio:', data.space);
                setSpace(data.space);
                console.log('6. Guardando contratos:', data.contracts);
                setContracts(data.contracts || []);
            } catch (error) {
                console.error('7. Error en fetchSpaceDetails:', error);
                console.log('8. Detalles del error:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                setError(error?.response?.data?.error || "Error loading space details");
            } finally {
                console.log('9. Finalizando fetchSpaceDetails');
                setLoading(false);
            }
        };

        console.log('0. SpaceDetails montado, id:', id);
        if (id) {
            fetchSpaceDetails();
        }
    }, [id]);

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
                <button onClick={handleGoToDashboard} className="back-button">
                    Go Back
                </button>
            </div>
        );
    }

    if (!space) {
        return (
            <div className="error-container">
                <p>Space not found</p>
                <button onClick={handleGoToDashboard} className="back-button">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-details-container">
            <div className="space-details-header">
                <h1>{space.spaceType} Details</h1>
            </div>

            <div className="space-details-content">
                {/* Image Gallery */}
                {space.gallery && space.gallery.length > 0 && (
                    <div className="space-gallery">
                        <ImageCarousel images={space.gallery} spaceId={space._id} />
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
                        <span className="detail-label">Status:</span>
                        <span className="detail-value status-badge">{space.status}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Monthly Price:</span>
                        <span className="detail-value price">€{space.monthlyPrice}</span>
                    </div>
                    {space.description && (
                        <div className="detail-item full-width">
                            <span className="detail-label">Description:</span>
                            <p className="detail-value description">{space.description}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="contracts-section">
                <div className="section-header">
                    <h2>Associated Contracts</h2>
                    <Link to={`/create-contract/${space._id}`} className="add-contract-button">
                        <FiPlus /> Add Contract
                    </Link>
                </div>

                {contracts.length === 0 ? (
                    <div className="no-contracts">
                        <p>No contracts for this space yet.</p>
                        <p>Click the button above to create a new contract.</p>
                    </div>
                ) : (
                    <div className="contracts-grid">
                        {contracts.map((contract) => (
                            <div key={contract._id} className="contract-card">
                                <div className="contract-header">
                                    <h3>{contract.contractType}</h3>
                                    <span className={`status-badge ${contract.contractStatus.toLowerCase()}`}>
                                        {contract.contractStatus}
                                    </span>
                                </div>
                                <div className="contract-details">
                                    <div className="contract-info">
                                        <span className="info-label">Tenant:</span>
                                        <span className="info-value">{contract.tenantDni}</span>
                                    </div>
                                    <div className="contract-info">
                                        <span className="info-label">Start:</span>
                                        <span className="info-value">{new Date(contract.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="contract-info">
                                        <span className="info-label">End:</span>
                                        <span className="info-value">{new Date(contract.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="contract-info">
                                        <span className="info-label">Monthly Payment:</span>
                                        <span className="info-value price">€{contract.monthlyPayment}</span>
                                    </div>
                                </div>
                                <div className="contract-actions">
                                    <Link to={`/edit-contract/${contract._id}`} className="edit-contract-button">
                                        <FiEdit2 /> Edit
                                    </Link>
                                    <button 
                                        onClick={() => handleDeleteContract(contract._id)}
                                        className="delete-contract-button"
                                    >
                                        <FiTrash2 /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bottom-actions">
                <button onClick={handleGoToDashboard} className="back-button-soft">
                    <FiArrowLeft /> Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default SpaceDetails;
