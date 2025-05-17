import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    // Check if the admin is authenticated on component mount
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            alert("Access denied. Please log in as admin.");
            navigate('/admin-login'); // Redirect to admin login if no token is found
        }
    }, []);

    // Handler for navigating to the data validation page
    const handleNavigateToValidation = () => {
        navigate('/admin-validation');
    };

    return (
        //FIXPOINT - i will use login container jus for test fast
        <div className="login-container">
            <h2>Admin Dashboard</h2>
            <button onClick={handleNavigateToValidation}>
                Data Validation
            </button>
            <button
                onClick={() => {
                    localStorage.removeItem('adminToken');
                    navigate('/admin-login');
                }}
            >
                Log Out
            </button>
            <button onClick={() => navigate('/')}>Home</button>


        </div>
    );
};

export default AdminDashboard;
