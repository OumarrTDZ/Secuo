import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api";
import { FiArrowLeft, FiUserCheck, FiHome, FiFileText, FiCheckSquare } from 'react-icons/fi';
import ReviewSidebar from '../components/ReviewSidebar';

const AdminValidation = () => {
    const [users, setUsers] = useState([]);
    const [spaces, setSpaces] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reviewType, setReviewType] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) {
                    navigate('/admin-login');
                    return;
                }

                const { data } = await api.get('/api/admins/check', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!data.isAdmin) {
                    navigate('/');
                    return;
                }

                fetchPendingValidations(token);
            } catch (error) {
                console.error(error);
                navigate('/');
            }
        };

        checkAdmin();
    }, [navigate]);

    const fetchPendingValidations = async (token) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const usersRes = await api.get('/api/users/pending', config);
            const spacesRes = await api.get('/api/spaces/pending', config);
            const contractsRes = await api.get('/api/contracts/pending', config);

            setUsers(usersRes.data.users);
            setSpaces(spacesRes.data);
            setContracts(contractsRes.data);
        } catch (error) {
            console.error("Error loading pending validations:", error);
        }
    };

    const handleValidation = async (type, id, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            switch (type) {
                case 'user':
                    await api.patch(`/api/users/${id}/validate`, 
                        { validationStatus: status }, config);
                    setUsers(users.filter(user => user._id !== id));
                    break;
                case 'space':
                    await api.patch(`/api/spaces/${id}/validate`,
                        { validationStatus: status }, config);
                    setSpaces(spaces.filter(space => space._id !== id));
                    break;
                case 'contract':
                    await api.patch(`/api/contracts/${id}/validate`,
                        { validationStatus: status }, config);
                    setContracts(contracts.filter(contract => contract._id !== id));
                    break;
                default:
                    break;
            }

            // Show success message
            const message = status === 'APPROVED' ? 'Item approved successfully' : 'Item rejected successfully';
            alert(message);

        } catch (error) {
            console.error("Error during validation:", error);
            // Show error message
            alert('Error during validation. Please try again.');
            throw error; // Re-throw the error so the sidebar knows the operation failed
        }
    };

    // Handle review button click
    const handleReview = (item, type) => {
        setSelectedItem(item);
        setReviewType(type);
        setSidebarOpen(true);
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">
                    <FiCheckSquare /> Pending Validations
                </h1>
                <div className="admin-actions">
                    <button 
                        className="admin-button secondary"
                        onClick={() => navigate('/admin-dashboard')}
                    >
                        <FiArrowLeft />
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Pending Users */}
            <section className="admin-section">
                <h2><FiUserCheck /> Pending Users</h2>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>DNI</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.dni}</td>
                                    <td>{user.firstName} {user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <div className="admin-actions">
                                            <button
                                                className="admin-button primary"
                                                onClick={() => handleReview(user, 'user')}
                                            >
                                                Review
                                            </button>
                                            <button
                                                className="admin-button success"
                                                onClick={() => handleValidation('user', user._id, 'APPROVED')}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="admin-button danger"
                                                onClick={() => handleValidation('user', user._id, 'REJECTED')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Pending Spaces */}
            <section className="admin-section">
                <h2><FiHome /> Pending Spaces</h2>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Size</th>
                                <th>Owner</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {spaces.map(space => (
                                <tr key={space._id}>
                                    <td>{space.spaceType}</td>
                                    <td>{space.squareMeters}m²</td>
                                    <td>{space.ownerDni}</td>
                                    <td>
                                        <div className="admin-actions">
                                            <button
                                                className="admin-button primary"
                                                onClick={() => handleReview(space, 'space')}
                                            >
                                                Review
                                            </button>
                                            <button
                                                className="admin-button success"
                                                onClick={() => handleValidation('space', space._id, 'APPROVED')}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="admin-button danger"
                                                onClick={() => handleValidation('space', space._id, 'REJECTED')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Pending Contracts */}
            <section className="admin-section">
                <h2><FiFileText /> Pending Contracts</h2>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Tenant</th>
                                <th>Owner</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map(contract => (
                                <tr key={contract._id}>
                                    <td>{contract.contractType}</td>
                                    <td>{contract.tenantDni}</td>
                                    <td>{contract.ownerDni}</td>
                                    <td>
                                        <div className="admin-actions">
                                            <button
                                                className="admin-button primary"
                                                onClick={() => handleReview(contract, 'contract')}
                                            >
                                                Review
                                            </button>
                                            <button
                                                className="admin-button success"
                                                onClick={() => handleValidation('contract', contract._id, 'APPROVED')}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="admin-button danger"
                                                onClick={() => handleValidation('contract', contract._id, 'REJECTED')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <ReviewSidebar
                isOpen={sidebarOpen}
                onClose={() => {
                    setSidebarOpen(false);
                    setSelectedItem(null);
                }}
                data={selectedItem}
                type={reviewType}
                onValidate={handleValidation}
            />
        </div>
    );
};

export default AdminValidation;

