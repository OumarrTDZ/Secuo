import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import '../styles/spaceDetails.css';
import ImageCarousel from "../components/ImageCarousel";
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';

const SpaceDetails = () => {
    const { id } = useParams();
    const [space, setSpace] = useState(null);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tenantNames, setTenantNames] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSpaceDetails = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const { data } = await axios.get(`http://localhost:5000/api/spaces/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSpace(data.space);

                // Fetch tenant names for each contract
                const contractsData = data.contracts;
                const tenantPromises = contractsData.map(async (contract) => {
                    try {
                        const userResponse = await axios.get(`http://localhost:5000/api/users/profile/${contract.tenantDni}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        return {
                            dni: contract.tenantDni,
                            name: `${userResponse.data.firstName} ${userResponse.data.lastName}`
                        };
                    } catch (err) {
                        console.log(`Tenant ${contract.tenantDni} not found in system`);
                        return {
                            dni: contract.tenantDni,
                            name: `Tenant (${contract.tenantDni})`
                        };
                    }
                });

                const tenants = await Promise.all(tenantPromises);
                const tenantNamesMap = tenants.reduce((acc, tenant) => {
                    acc[tenant.dni] = tenant.name;
                    return acc;
                }, {});

                setTenantNames(tenantNamesMap);
                setContracts(contractsData);
                setError(null);
            } catch (error) {
                console.error("Error fetching space details:", error);
                setError(error.response?.data?.error || "Error loading space details");
            } finally {
                setLoading(false);
            }
        };

        fetchSpaceDetails();
    }, [id]);

    const handleGoToDashboard = () => {
        navigate('/dashboard-owner');
    };

    const handleDeleteSpace = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este espacio? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            await axios.delete(`http://localhost:5000/api/spaces/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/dashboard-owner');
        } catch (error) {
            console.error("Error deleting space:", error);
            alert(error.response?.data?.error || "Error deleting space");
        }
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

            setContracts(contracts.filter(contract => contract._id !== contractId));
        } catch (error) {
            console.error("Error deleting contract:", error);
            alert(error.response?.data?.message || "Error deleting contract");
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
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
                <div className="space-actions">
                    <Link to={`/edit-space/${space._id}`} className="edit-button">
                        <FiEdit2 /> Edit Space
                    </Link>
                    <button onClick={handleDeleteSpace} className="delete-button">
                        <FiTrash2 /> Delete Space
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
                        <span className="detail-label">Status:</span>
                        <span className="detail-value status-badge">{space.status}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Monthly Earnings:</span>
                        <span className="detail-value price">€{space.monthlyEarnings}</span>
                    </div>
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

            <div className="contracts-section">
                <div className="section-header">
                    <h2>Associated Contracts</h2>
                    <Link to={`/create-contract/${space._id}`} className="add-contract-button">
                        <FiPlus /> Add Contract
                    </Link>
                </div>

                {contracts.length === 0 ? (
                    <div className="no-contracts-message">
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
                                    <p><strong>Tenant Name:</strong> {contract.tenantName}</p>
                                    <p><strong>Tenant DNI:</strong> {contract.tenantDni}</p>
                                    <p><strong>Start Date:</strong> {new Date(contract.startDate).toLocaleDateString()}</p>
                                    <p><strong>End Date:</strong> {new Date(contract.endDate).toLocaleDateString()}</p>
                                    <p><strong>Monthly Payment:</strong> €{contract.monthlyPayment}</p>
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
