import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import "../styles/pages/register.css";

const PasswordStrength = ({ password }) => {
    const getStrength = (pass) => {
        let score = 0;
        if (!pass) return score;

        // Length check
        if (pass.length >= 8) score++;
        if (pass.length >= 12) score++;

        // Complexity checks
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        return score;
    };

    const strength = getStrength(password);
    const getColor = () => {
        switch (strength) {
            case 0: return '#ff4444';
            case 1: return '#ffbb33';
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
                        style={{
                            backgroundColor: index < strength ? getColor() : '#e0e0e0',
                        }}
                    />
                ))}
            </div>
            <span className="strength-label" style={{ color: getColor() }}>
                {getLabel()}
            </span>
        </div>
    );
};

const DNIUpload = ({ onFileChange }) => {
    const [dniFiles, setDniFiles] = useState({
        idFrontPhoto: null,
        idBackPhoto: null
    });
    const [previews, setPreviews] = useState({
        idFrontPhoto: null,
        idBackPhoto: null
    });

    const handleDrop = useCallback((e, side) => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0] || e.target.files[0];
        
        if (file && file.type.startsWith('image/')) {
            const fieldName = side === 'front' ? 'idFrontPhoto' : 'idBackPhoto';
            setDniFiles(prev => ({ ...prev, [fieldName]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [fieldName]: reader.result }));
            };
            reader.readAsDataURL(file);
            onFileChange(side, file);
        }
    }, [onFileChange]);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('active');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('active');
    };

    const removeFile = (side) => {
        const fieldName = side === 'front' ? 'idFrontPhoto' : 'idBackPhoto';
        setDniFiles(prev => ({ ...prev, [fieldName]: null }));
        setPreviews(prev => ({ ...prev, [fieldName]: null }));
        onFileChange(side, null);
    };

    return (
        <div className="dni-upload-container">
            <div className="dni-upload-side">
                <h4>DNI Frontal</h4>
                <div
                    className={`dropzone ${dniFiles.idFrontPhoto ? 'has-file' : ''}`}
                    onDrop={(e) => handleDrop(e, 'front')}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {previews.idFrontPhoto ? (
                        <div className="preview-container">
                            <img src={previews.idFrontPhoto} alt="DNI frontal" />
                            <button 
                                type="button" 
                                className="remove-file"
                                onClick={() => removeFile('front')}
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <>
                            <p>Arrastra aquí la foto frontal del DNI o</p>
                            <label className="upload-button">
                                Seleccionar archivo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleDrop(e, 'front')}
                                    hidden
                                />
                            </label>
                        </>
                    )}
                </div>
            </div>

            <div className="dni-upload-side">
                <h4>DNI Trasero</h4>
                <div
                    className={`dropzone ${dniFiles.idBackPhoto ? 'has-file' : ''}`}
                    onDrop={(e) => handleDrop(e, 'back')}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {previews.idBackPhoto ? (
                        <div className="preview-container">
                            <img src={previews.idBackPhoto} alt="DNI trasero" />
                            <button 
                                type="button" 
                                className="remove-file"
                                onClick={() => removeFile('back')}
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <>
                            <p>Arrastra aquí la foto trasera del DNI o</p>
                            <label className="upload-button">
                                Seleccionar archivo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleDrop(e, 'back')}
                                    hidden
                                />
                            </label>
                        </>
                    )}
                </div>
            </div>
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
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, [onFileChange]);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('active');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('active');
    };

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
                        <img src={preview} alt="Foto de perfil" className="profile-preview" />
                        <button 
                            type="button" 
                            className="profile-remove-button"
                            onClick={removePhoto}
                        >
                            ×
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="profile-placeholder">
                            <i className="fas fa-user"></i>
                        </div>
                        <p>Arrastra aquí tu foto de perfil o</p>
                        <label className="upload-button">
                            Seleccionar archivo
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleDrop}
                                hidden
                            />
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
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dni: '',
        password: '',
        confirmPassword: '',
        preference: 'TENANT',
        idFrontPhoto: null,
        idBackPhoto: null,
        profilePhoto: null
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleDNIFileChange = (side, file) => {
        setFormData(prev => ({
            ...prev,
            [side === 'front' ? 'idFrontPhoto' : 'idBackPhoto']: file
        }));
    };

    const handleProfilePhotoChange = (file) => {
        setFormData(prev => ({
            ...prev,
            profilePhoto: file
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.idFrontPhoto || !formData.idBackPhoto) {
            setError('Por favor, sube ambas fotos del DNI');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'confirmPassword') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const response = await axios.post('http://localhost:5000/api/users/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            setSuccess('¡Registro exitoso! Redirigiendo al login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setError(error.response?.data?.error || 'Error en el registro. Por favor, inténtalo de nuevo.');
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h2>Crear tu cuenta</h2>
                    <p>Únete a SECUO hoy y experimenta la gestión moderna de propiedades.</p>
                </div>

                <form className="register-form" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-group">
                        <label htmlFor="firstName" className="required">Nombre</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            placeholder="Ingresa tu nombre"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName" className="required">Apellidos</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            placeholder="Ingresa tus apellidos"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="required">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Ingresa tu email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber" className="required">Teléfono</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            placeholder="Ingresa tu número de teléfono"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="dni" className="required">DNI</label>
                        <input
                            type="text"
                            id="dni"
                            name="dni"
                            value={formData.dni}
                            onChange={handleChange}
                            required
                            placeholder="Ingresa tu DNI"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="preference" className="required">Soy un</label>
                        <select
                            id="preference"
                            name="preference"
                            value={formData.preference}
                            onChange={handleChange}
                            required
                        >
                            <option value="TENANT">Inquilino</option>
                            <option value="OWNER">Propietario</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="required">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Crea una contraseña"
                        />
                        <PasswordStrength password={formData.password} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="required">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirma tu contraseña"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="required">Fotos del DNI</label>
                        <DNIUpload onFileChange={handleDNIFileChange} />
                    </div>

                    <div className="form-group full-width">
                        <label>Foto de Perfil (Opcional)</label>
                        <ProfilePhotoUpload 
                            onFileChange={handleProfilePhotoChange}
                            currentPhoto={formData.profilePhoto}
                        />
                    </div>

                    <button type="submit">Crear Cuenta</button>
                </form>

                <div className="login-link">
                    ¿Ya tienes una cuenta?<Link to="/login">Inicia sesión aquí</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
