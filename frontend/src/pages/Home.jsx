import { Link } from "react-router-dom";
import "../styles/pages/home.css";
import logo from "../assets/logo.png";

const Home = () => {
    return (
        <div className="home-container">
            {/* Header with logo and navigation */}
            <header className="home-header">
                <div className="logo-area">
                    <img src={logo} alt="Secuo logo" className="logo" />
                    <h1 className="brand">Secuo</h1>
                </div>
                <nav className="nav-links">
                    <Link to="/login">Login</Link>
                    <Link to="/admin-login">Administrators</Link>
                    <Link to="/register" className="register-btn">Register</Link>
                </nav>
            </header>

            {/* Main hero section with introduction */}
            <main className="hero-section">
                <h2>Manage your properties with ease</h2>
                <p>
                    Six out of ten tenants face difficulties finding reliable properties.
                    With <strong>Secuo</strong>, you simplify contract, payment, and space management all in one place.
                </p>
                <Link to="/register">
                    <button className="cta-btn">Get Started Now</button>
                </Link>
            </main>

            {/* Features section describing main benefits */}
            <section className="features">
                <div className="feature-box">
                    <h3>Digital Contracts</h3>
                    <p>Create and sign legally valid contracts digitally, no paperwork needed.</p>
                </div>
                <div className="feature-box">
                    <h3>Smart Dashboard</h3>
                    <p>Monitor payments, deadlines, and more from an intuitive dashboard.</p>
                </div>
                <div className="feature-box">
                    <h3>Security</h3>
                    <p>Data protection, secure access, and automatic validations.</p>
                </div>
            </section>

            {/* Footer with copyright */}
            <footer className="footer">
                © {new Date().getFullYear()} Secuo. All rights reserved.
            </footer>
        </div>
    );
};

export default Home;
