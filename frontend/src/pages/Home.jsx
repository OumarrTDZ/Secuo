import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/pages/home.css";
import logo from "../assets/logo.png";

const Home = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="home-container">
            {/* Header with logo and navigation */}
            <header className={`home-header ${isScrolled ? 'scrolled' : ''}`}>
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
                <h2>Manage your properties<br />with confidence</h2>
                <p>
                    Six out of ten tenants face difficulties finding reliable properties.
                    With <strong>Secuo</strong>, you simplify contract, payment, and space management all in one place.
                    Join thousands of satisfied property owners and tenants.
                </p>
                <Link to="/register">
                    <button className="cta-btn">Get Started Now</button>
                </Link>
            </main>

            {/* Features section */}
            <section className="features">
                <div className="feature-box">
                    <h3>Smart Contract Management</h3>
                    <p>Digitize and automate your rental agreements with secure, easy-to-use contract management tools.</p>
                </div>
                <div className="feature-box">
                    <h3>Seamless Communication</h3>
                    <p>Direct messaging between owners and tenants ensures clear, documented communication at all times.</p>
                </div>
                <div className="feature-box">
                    <h3>Property Maintenance</h3>
                    <p>Track maintenance requests, schedule repairs, and keep your properties in perfect condition.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>© 2024 Secuo Property Manager. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
