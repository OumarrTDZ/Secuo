import { useNavigate } from "react-router-dom";
import "../styles/components/sidebarRight.css";
import Avatar from '../components/Avatar.jsx';
import ProfilePhotoMenu from "./ProfilePhotoMenu.jsx";
import { useState } from "react";
import { 
    FiEdit2, 
    FiUser, 
    FiMail, 
    FiPhone, 
    FiCreditCard,
    FiLogOut 
} from 'react-icons/fi';

const SidebarRight = ({ user, reloadUser }) => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    // Handle user logout and redirect to login page
    const handleLogout = () => {
        localStorage.removeItem("userToken");
        navigate("/login");
    };

    if (!user) {
        return (
            <div className="sidebar-right">
                <p>Loading user data...</p>
            </div>
        );
    }

    return (
        <div className="sidebar-right">
            <div className="sidebar-content">
                {/* Profile section */}
                <div className="profile-section">
                    <div className="profile-header">
                        <h2>Profile</h2>
                        <button 
                            className="edit-profile-button"
                            onClick={() => navigate("/edit-profile")}
                            aria-label="Edit profile"
                        >
                            <FiEdit2 className="edit-icon" />
                        </button>
                    </div>

                    {/* Avatar section */}
                    <div 
                        className="avatar-container"
                        onClick={() => setShowMenu(!showMenu)} 
                    >
                        <Avatar
                            src={user?.profilePhoto ? `http://localhost:5000${user.profilePhoto}` : undefined}
                            size={120}
                        />
                        <div className="avatar-overlay">
                            <FiEdit2 className="avatar-edit-icon" />
                        </div>
                    </div>

                    {/* Profile photo menu */}
                    {showMenu && (
                        <ProfilePhotoMenu
                            user={user}
                            onUpdate={reloadUser}
                            onClose={() => setShowMenu(false)}
                        />
                    )}

                    {/* User info cards */}
                    <div className="user-info-section">
                        <div className="info-card">
                            <div className="info-icon">
                                <FiUser />
                            </div>
                            <div className="info-content">
                                <span className="info-label">Name</span>
                                <span className="info-value">{user.firstName} {user.lastName}</span>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">
                                <FiCreditCard />
                            </div>
                            <div className="info-content">
                                <span className="info-label">DNI</span>
                                <span className="info-value">{user.dni}</span>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">
                                <FiMail />
                            </div>
                            <div className="info-content">
                                <span className="info-label">Email</span>
                                <span className="info-value">{user.email}</span>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">
                                <FiPhone />
                            </div>
                            <div className="info-content">
                                <span className="info-label">Phone</span>
                                <span className="info-value">{user.phoneNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout button */}
            <div className="sidebar-footer">
                <button className="logout-button" onClick={handleLogout}>
                    <FiLogOut className="logout-icon" />
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default SidebarRight;
