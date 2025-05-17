import { useState } from 'react';
import { useDropzone } from "react-dropzone";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/pages/register.css";

const Register = () => {
    const navigate = useNavigate();

    const [dni, setDni] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [preference, setPreference] = useState('TENANT');
    const [password, setPassword] = useState('');
    const [idFrontPhoto, setIdFrontPhoto] = useState(null);
    const [idBackPhoto, setIdBackPhoto] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('dni', dni);
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('email', email);
        formData.append('phoneNumber', phoneNumber);
        formData.append('preference', preference);
        formData.append('password', password);

        if (idFrontPhoto) formData.append('idFrontPhoto', idFrontPhoto);
        if (idBackPhoto) formData.append('idBackPhoto', idBackPhoto);
        if (profilePhoto) formData.append('profilePhoto', profilePhoto);

        try {
            await axios.post('http://localhost:5000/api/users/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            navigate('/login');
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Error registering user');
        }
    };

    const createDropzone = (setFile, label) => {
        const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
            onDrop: (acceptedFiles) => {
                setFile(acceptedFiles[0])
            },
            multiple: false,
            accept: { "image/*": [] }
        })
        return (
            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                <p>{isDragActive ? 'Drop the image here...' : label}</p>
                {acceptedFiles.length > 0 && (
                    <small>File: {acceptedFiles[0].name}</small>
                )}
            </div>
        );
    };

    return (
        <div className="register-container">
            <h2>User Registration</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <label className="required">DNI</label>
                <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} required />

                <label className="required">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />

                <label className="required">Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />

                <label className="required">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label className="required">Phone Number</label>
                <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />

                <label>Role</label>
                <select value={preference} onChange={(e) => setPreference(e.target.value)}>
                    <option value="TENANT">Tenant</option>
                    <option value="OWNER">Owner</option>
                </select>

                <label className="required">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <div className="dropzone-wrapper">
                    <label className="required">Upload your DNI photo - Front</label>
                    {createDropzone(setIdFrontPhoto, "Drag and drop FROT photo here, or click to select")}
                </div>

                <div className="dropzone-wrapper">
                    <label className="required">Upload your DNI photo - Back</label>
                    {createDropzone(setIdBackPhoto, "Drag and drop BACK photo here, or click to select")}
                </div>

                <div className="dropzone-wrapper">
                    <label className="required">Upload your profile photo</label>
                    {createDropzone(setProfilePhoto, "Drag and drop PROFILE photo here, or click to select")}
                </div>

                <button type="submit">Register</button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
}

export default Register;
