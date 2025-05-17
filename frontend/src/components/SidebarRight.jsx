import { useNavigate } from "react-router-dom";
import "../styles/components/sidebarRight.css";
import Avatar from '../components/Avatar.jsx';
import ProfilePhotoMenu from "./ProfilePhotoMenu.jsx";
import { useState } from "react";

const SidebarRight = ({ user, reloadUser }) => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    // Handle user logout and redirect to login page
    const handleLogout = () => {
        localStorage.removeItem("userToken");
        navigate("/login");
    };

    return (
        <div className="sidebar-right">
            {/* Button to navigate to profile edit page */}
            <button
                className="edit-profile-button"
                onClick={() => navigate("/edit-profile")}
            >
                Edit Profile
            </button>

            {/* Avatar that toggles the profile photo menu on click */}
            <div onClick={() => setShowMenu(!showMenu)} style={{ cursor: 'pointer' }}>
                <Avatar
                    src={user?.profilePhoto ? `http://localhost:5000${user.profilePhoto}` : undefined}
                    size={100}
                />
            </div>

            {/* Conditional rendering of profile photo upload/delete menu */}
            {showMenu && (
                <ProfilePhotoMenu
                    user={user}
                    onUpdate={reloadUser}   // Callback to reload user data after photo update
                    onClose={() => setShowMenu(false)}  // Close the menu
                />
            )}

            {/* Display user info or loading state */}
            {user ? (
                <>
                    <div className="user-data-profile">
                    <p><strong>{user.firstName} {user.lastName}</strong></p>
                    <p>DNI: {user.dni}</p>
                    <p>Email: {user.email}</p>
                    <p>Phone: {user.phoneNumber}</p>
                    </div>
                </>
            ) : (
                <p>Loading user data...</p>
            )}

            {/* Logout button */}
            <button className="logout-button" onClick={handleLogout}>
                Log Out
            </button>
        </div>
    );
};

export default SidebarRight;
