import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/pages/adminValidation.css"

const AdminValidation = () => {
    const [users, setUsers] = useState([]);
    const [spaces, setSpaces] = useState([]);
    const [contracts, setContracts] = useState([]);
    const navigate = useNavigate();

    // Approve or reject validation for user, space or contract
    const handleValidation = async (type, id, validationStatus) => {
        const endpointMap = {
            user: `http://localhost:5000/api/users/${id}/validate`,
            space: `http://localhost:5000/api/spaces/${id}/validate`,
            contract: `http://localhost:5000/api/contracts/${id}/validate`
        };

        try {
            const token = localStorage.getItem('adminToken');
            await axios.patch(endpointMap[type], { validationStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} ${validationStatus === "APPROVED" ? "approved" : "rejected"}.`);
            fetchPendingValidations(token);
        } catch (error) {
            console.error(`Error validating ${type}:`, error);
            alert(`Failed to update ${type} validation.`);
        }
    };

    // Check if admin token is valid and fetch pending validations
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) {
                    alert('Access denied. Please login as admin.');
                    navigate('/admin-login');
                    return;
                }

                const { data } = await axios.get('http://localhost:5000/api/admins/check', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!data.isAdmin) {
                    alert('You do not have admin permissions.');
                    navigate('/');
                    return;
                }

                fetchPendingValidations(token);
            } catch (error) {
                alert('Error verifying admin permissions.');
                console.error(error);
                navigate('/');
            }
        };

        checkAdmin();
    }, [navigate]);

    // Fetch all pending validations for users, spaces, and contracts
    const fetchPendingValidations = async (token) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const usersRes = await axios.get('http://localhost:5000/api/users/pending', config);
            const spacesRes = await axios.get('http://localhost:5000/api/spaces/pending', config);
            const contractsRes = await axios.get('http://localhost:5000/api/contracts/pending', config);

            setUsers(usersRes.data.users);
            setSpaces(spacesRes.data);
            setContracts(contractsRes.data);
        } catch (error) {
            console.error("Error loading pending validations:", error);
            alert("Failed to load pending validations.");
        }
    };

    return (
        <div className="validation-container">
            <h2>Data Validation</h2>

            <section>
                <h3>Pending Users</h3>
                {users.length > 0 ? (
                    users.map(user => (
                        <div key={user._id}>
                            <p><strong>{user.firstName} {user.lastName}</strong></p>
                            <p>Email: {user.email} | Phone: {user.phoneNumber}</p>
                            <p>Preference: {user.preference} | DNI: {user.dni}</p>
                            <button onClick={() => handleValidation('user', user._id, "APPROVED")}>Approve</button>
                            <button onClick={() => handleValidation('user', user._id, "REJECTED")}>Reject</button>
                        </div>
                    ))
                ) : (
                    <p>No pending users.</p>
                )}
            </section>

            <section>
                <h3>Pending Spaces</h3>
                {spaces.length > 0 ? (
                    spaces.map(space => (
                        <div key={space._id}>
                            <p><strong>{space.spaceType} - {space.description}</strong></p>
                            <p>Owner DNI: {space.ownerDni} | Status: {space.status}</p>
                            <p>Monthly Price: €{space.monthlyPrice} | Sale Price: €{space.salePrice}</p>
                            <button onClick={() => handleValidation('space', space._id, "APPROVED")}>Approve</button>
                            <button onClick={() => handleValidation('space', space._id, "REJECTED")}>Reject</button>
                        </div>
                    ))
                ) : (
                    <p>No pending spaces.</p>
                )}
            </section>

            <section>
                <h3>Pending Contracts</h3>
                {contracts.length > 0 ? (
                    contracts.map(contract => (
                        <div key={contract._id}>
                            <p><strong>{contract.contractType} - {contract.contractStatus}</strong></p>
                            <p>Owner DNI: {contract.ownerDni} | Tenant DNI: {contract.tenantDni}</p>
                            <p>Monthly Payment: €{contract.monthlyPayment} | Payment Status: {contract.paymentStatus}</p>
                            <button onClick={() => handleValidation('contract', contract._id, "APPROVED")}>Approve</button>
                            <button onClick={() => handleValidation('contract', contract._id, "REJECTED")}>Reject</button>
                        </div>
                    ))
                ) : (
                    <p>No pending contracts.</p>
                )}
            </section>
            <button onClick={() => navigate('/admin-dashboard')}>
                Back Dashboard
            </button>
        </div>
    );
};

export default AdminValidation;
