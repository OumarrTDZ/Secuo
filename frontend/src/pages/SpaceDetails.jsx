import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import '../styles/styles.css';

const SpaceDetails = () => {
    const { spaceId } = useParams();
    const [space, setSpace] = useState(null);
    const [contracts, setContracts] = useState([]);
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        const fetchSpaceDetails = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/spaces/${spaceId}`);
                setSpace(data.space || null);
                setContracts(data.contracts || []);
            } catch (error) {
                console.error("Error fetching space details:", error);
            }
        };

        fetchSpaceDetails();
    }, [spaceId]);

    if (!space) return <p>Loading space details...</p>;

    return (
        <div className="container">
            <div className="space-details">
                <h2>Space Details</h2>
                <p><strong>Type:</strong> {space.spaceType}</p>
                <p><strong>Description:</strong> {space.description}</p>
                <p><strong>Location:</strong> {space.location}</p>
                <p><strong>Monthly Price:</strong> €{space.monthlyPrice}</p>
            </div>

            <div className="contracts">
                <div className="section-header">
                    <h2>Associated Contracts</h2>
                </div>
                <Link to={`/contracts/new?spaceId=${space._id}`} className="add-contract-link">
                    Add Contract
                </Link>

                {contracts.length === 0 ? (
                    <p className="new-contracts">No contracts for this space.</p>
                ) : (
                    contracts.map((contract) => (
                        <div key={contract._id} className="contract">
                            <p><strong>Type:</strong> {contract.contractType}</p>
                            <p><strong>Tenant:</strong> {contract.tenantDni}</p>
                            <p><strong>Start:</strong> {new Date(contract.startDate).toLocaleDateString()}</p>
                            <p><strong>End:</strong> {new Date(contract.endDate).toLocaleDateString()}</p>
                            <p><strong>Monthly Payment:</strong> €{contract.monthlyPayment}</p>
                            <p><strong>Contract Status:</strong> {contract.contractStatus}</p>

                            <Link to={`/edit-contract/${contract._id}`} className="edit-contract-link">
                                Edit Contract
                            </Link>
                        </div>
                    ))
                )}
            </div>

            <button onClick={handleGoBack} className="back-button">
                Go Back
            </button>
        </div>
    );
};

export default SpaceDetails;
