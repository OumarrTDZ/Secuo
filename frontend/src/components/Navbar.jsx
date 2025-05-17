import { usePreference } from '../context/PreferenceContext'; // Import context hook for user preference
import '../styles/components/navbar.css';
import logo from '../assets/logo.png';

const Navbar = ({ user }) => {
    const { preference, togglePreference } = usePreference();

    // Get initial letter of user's first name or fallback based on preference
    const getInitial = () => {
        if (user?.firstName) return user.firstName[0].toUpperCase();
        return preference === 'TENANT' ? 'T' : 'O';
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                {/* Display user initial as avatar */}
                <div className="avatar">{getInitial()}</div>
                {/* Welcome message with user full name if available */}
                <span className="welcome">Welcome {user?.firstName + " " + user?.lastName || ""}</span>
            </div>

            <div className="navbar-right">
                {/* Toggle switch to switch user preference between OWNER and TENANT */}
                <label className="switch">
                    <input type="checkbox" checked={preference === 'OWNER'} onChange={togglePreference} />
                    <span className="slider round"></span>
                </label>
                {/* Company logo */}
                <img src={logo} alt="Company Logo" className="logo" />
            </div>
        </nav>
    );
};

export default Navbar;
