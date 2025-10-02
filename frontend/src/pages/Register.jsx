import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from 'api';
import "../styles/pages/register.css";

const PasswordStrength = ({ password }) => {
    const getStrength = (pass) => {
        let score = 0;
        if (!pass) return score;

        if (pass.length >= 8) score++;
        if (pass.length >= 12) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        return score;
    };

    const strength = getStrength(password);
    const getColor = () => {
        switch (strength) {
            case 0: return '#ff4444';
            case 1:
            case 2: return '#ffbb33';
            case 3: return '#00C851';
            case 4:
            case 5: return '#007E33';
            default: return '#ff4444';
        }
    };

    const getLabel = () => {
        switch (strength) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4:
            case 5: return 'Strong';
            default: return 'Very Weak';
        }
    };

    return (
        <div className="password-strength">
            <div className="strength-bars">
                {[...Array(5)].map((_, index) => (
                    <div
                        key={index}
                        className="strength-bar"
                        style={{ backgroundColor: index < strength ? getColor() : '#e0e0e0' }}
                    />
                ))}
            </div>
            <span className="strength-label" style={{ color: getColor() }}>{getLabel()}</span>
        </div>
    );
};

const DNIUpload = ({ onFileChange }) => {
    const [dniFiles, setDniFiles] = useState({ idFrontPhoto: null, idBackPhoto: null });
    const [previews, setPreviews] = useState({ idFrontPhoto: null, idBackPhoto: null });

    const handleDrop = useCallback((e, side) => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0] || e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const fieldName = side === 'front' ? 'idFrontPhoto' : 'idBackPhoto';
            setDniFiles(prev => ({ ...prev, [fieldName]: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreviews(prev => ({ ...prev, [fieldName]: reader.result }));
            reader.readAsDataURL(file);
            onFileChange(side, file);
        }
    }, [onFileChange]);

    const handleDragOver = (e) => e.preventDefault();
    const handleDragLeave = (e) => e.currentTarget.classList.remove('active');
    const removeFile = (side) => {
        const fieldName = side === 'front' ? 'idFrontPhoto' : 'idBackPhoto';
        setDniFiles(prev => ({ ...prev, [fieldName]: null }));
        setPreviews(prev => ({ ...prev, [fieldName]: null }));
        onFileChange(side, null);
    };

    return (
        <div className="dni-upload-container">
            {[{ side: 'front', label: 'Front of DNI', preview: previews.idFrontPhoto },
                { side: 'back', label: 'Back of DNI', preview: previews.idBackPhoto }].map(({ side, label, preview }) => (
                <div className="dni-upload-side" key={side}>
                    <h4>{label}</h4>
                    <div
                        className={`dropzone ${dniFiles[`id${side === 'front' ? 'Front' : 'Back'}Photo`] ? 'has-file' : ''}`}
                        onDrop={(e) => handleDrop(e, side)}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        {preview ? (
                            <div className="preview-container">
                                <img src={preview} alt={`${label}`} />
                                <button type="button" className="remove-file" onClick={() => removeFile(side)}>×</button>
                            </div>
                        ) : (
                            <>
                                <p>Drag and drop the {label.toLowerCase()} or</p>
                                <label className="upload-button">
                                    Select file
                                    <input type="file" accept="image/*" onChange={(e) => handleDrop(e, side)} hidden />
                                </label>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const ProfilePhotoUpload = ({ onFileChange, currentPhoto }) => {
    const [preview, setPreview] = useState(null);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0] || e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            onFileChange(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    }, [onFileChange]);

    const handleDragOver = (e) => e.preventDefault();
    const handleDragLeave = (e) => e.currentTarget.classList.remove('active');
    const removePhoto = () => {
        onFileChange(null);
        setPreview(null);
    };

    return (
        <div className="profile-upload-container">
            <div
                className={`dropzone profile-dropzone ${preview ? 'has-file' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {preview ? (
                    <div className="profile-preview-container">
                        <img src={preview} alt="Profile Photo" className="profile-preview" />
                        <button type="button" className="profile-remove-button" onClick={removePhoto}>×</button>
                    </div>
                ) : (
                    <>
                        <div className="profile-placeholder">
                            <i className="fas fa-user"></i>
                        </div>
                        <p>Drag and drop your profile photo or</p>
                        <label className="upload-button">
                            Select file
                            <input type="file" accept="image/*" onChange={handleDrop} hidden />
                        </label>
                    </>
                )}
            </div>
        </div>
    );
};

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '', dni: '',
        password: '', confirmPassword: '', preference: 'TENANT',
        idFrontPhoto: null, idBackPhoto: null, profilePhoto: null
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleDNIFileChange = (side, file) => {
        setFormData(prev => ({ ...prev, [side === 'front' ? 'idFrontPhoto' : 'idBackPhoto']: file }));
    };

    const handleProfilePhotoChange = (file) => {
        setFormData(prev => ({ ...prev, profilePhoto: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.idFrontPhoto || !formData.idBackPhoto) {
            setError('Please upload both sides of the DNI');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'confirmPassword') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            await api.post('http://localhost:5000/api/users/register', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setError(error.response?.data?.error || 'Registration error. Please try again.');
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h2>Create Your Account</h2>
                    <p>Join SECUO today and experience modern property management.</p>
                </div>

                <form className="register-form" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-group">
                        <label htmlFor="firstName" className="required">First Name</label>
                        <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Enter your first name" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName" className="required">Last Name</label>
                        <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Enter your last name" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="required">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber" className="required">Phone Number</label>
                        <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="Enter your phone number" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="dni" className="required">DNI</label>
                        <input type="text" id="dni" name="dni" value={formData.dni} onChange={handleChange} required placeholder="Enter your DNI" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="preference" className="required">I am a</label>
                        <select id="preference" name="preference" value={formData.preference} onChange={handleChange} required>
                            <option value="TENANT">Tenant</option>
                            <option value="OWNER">Owner</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="required">Password</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create a password" />
                        <PasswordStrength password={formData.password} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="required">Confirm Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm your password" />
                    </div>

                    <div className="form-group full-width">
                        <label className="required">DNI Photos</label>
                        <DNIUpload onFileChange={handleDNIFileChange} />
                    </div>

                    <div className="form-group full-width">
                        <label>Profile Photo (Optional)</label>
                        <ProfilePhotoUpload onFileChange={handleProfilePhotoChange} currentPhoto={formData.profilePhoto} />
                    </div>

                    <button type="submit">Create Account</button>
                </form>

                <div className="login-link">
                    Already have an account? <Link to="/login">Log in here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
