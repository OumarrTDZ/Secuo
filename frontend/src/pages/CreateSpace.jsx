import { useState, useEffect } from 'react';
import api from './api.js';
import '../styles/pages/createSpace.css';
import '../styles/components/forms.css';
import { useNavigate } from 'react-router-dom';
import ImageDropZone from "../components/ImageDropZone.jsx";

const CreateSpace = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        spaceType: 'APARTMENT',
        floor: '',
        door: '',
        squareMeters: '',
        rooms: '',
        marking: '',
        description: '',
        status: 'AVAILABLE',
        ownerDni: '',
        municipality: '',
        city: '',
        address: '',
        postalCode: ''
    });

    const [gallery, setGallery] = useState([]);
    const [validationDocument, setValidationDocument] = useState([]);
    const [message, setMessage] = useState('');
    const [token, setToken] = useState(localStorage.getItem('userToken'));
    const [userDni, setUserDni] = useState(localStorage.getItem('dni'));

    useEffect(() => {
        if (!token || !userDni) {
            setMessage('You must be logged in to access this page.');
        } else {
            setFormData(prev => ({ ...prev, ownerDni: userDni }));
        }
    }, [token, userDni]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token || !userDni) {
            return setMessage("Authentication failed. Please log in again.");
        }

        if (!formData.spaceType || !formData.squareMeters || !formData.ownerDni || validationDocument.length === 0) {
            return setMessage("Please complete all required fields and upload at least one validation document.");
        }

        try {
            // Create space
            const spaceResponse = await api.post('http://localhost:5000/api/spaces', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const spaceId = spaceResponse.data.space._id;

            // Upload files (both gallery and validation documents) in a single request
            if (gallery.length > 0 || validationDocument.length > 0) {
                const uploadData = new FormData();
                
                // Add gallery images
                gallery.forEach(file => {
                    uploadData.append('gallery', file);
                });

                // Add validation documents
                validationDocument.forEach(file => {
                    uploadData.append('validationDocuments', file);
                });

                await api.post(`http://localhost:5000/api/spaces/${spaceId}/upload`, uploadData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    }
                });
            }

            setMessage("✅ Space created successfully!");
            setTimeout(() => navigate('/dashboard-owner'), 1500);
        } catch (error) {
            console.error(error);
            setMessage(error?.response?.data?.error || "An unexpected error occurred while creating the space.");
        }
    };

    return (
        <div className="form-container">
            <div className="form-wrapper">
                <div className="form-header">
                    <h2>Create New Rental Space</h2>
                    <p>Fill in the details below to list your property on SECUO.</p>
                </div>

                {message && (
                    <div className={message.includes("✅") ? "success-message" : "error-message"}>
                        {message}
                    </div>
                )}

                <form className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="required">Space Type</label>
                        <select name="spaceType" value={formData.spaceType} onChange={handleChange}>
                            <option value="APARTMENT">Apartment</option>
                            <option value="GARAGE">Garage</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Space Name</label>
                        <input 
                            name="marking" 
                            type="text" 
                            placeholder="Enter a name for your space"
                            value={formData.marking} 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className="form-group">
                        <label>Floor</label>
                        <input 
                            name="floor" 
                            type="number" 
                            placeholder="Floor number"
                            value={formData.floor} 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className="form-group">
                        <label>Door</label>
                        <input 
                            name="door" 
                            type="text" 
                            placeholder="Door number/letter"
                            value={formData.door} 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">Square Meters</label>
                        <input 
                            name="squareMeters" 
                            type="number" 
                            placeholder="Property size in m²"
                            value={formData.squareMeters} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Number of Rooms</label>
                        <input 
                            name="rooms" 
                            type="number" 
                            placeholder="Number of rooms"
                            value={formData.rooms} 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea 
                            name="description" 
                            placeholder="Describe your property..."
                            value={formData.description} 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="AVAILABLE">Available</option>
                            <option value="OCCUPIED">Occupied</option>
                            <option value="MAINTENANCE">Under Maintenance</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="required">Municipality</label>
                        <input 
                            name="municipality" 
                            type="text" 
                            placeholder="Enter municipality"
                            value={formData.municipality} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">City</label>
                        <input 
                            name="city" 
                            type="text" 
                            placeholder="Enter city"
                            value={formData.city} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="required">Address</label>
                        <input 
                            name="address" 
                            type="text" 
                            placeholder="Enter full street address"
                            value={formData.address} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">Postal Code</label>
                        <input 
                            name="postalCode" 
                            type="text" 
                            placeholder="Enter postal code"
                            value={formData.postalCode} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Image Gallery</label>
                        <ImageDropZone
                            files={gallery}
                            setFiles={setGallery}
                            maxFiles={10}
                            label="Drag images or click to select (Max 10)"
                            fileType="image"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="required">Property Validation Documents</label>
                        <ImageDropZone
                            files={validationDocument}
                            setFiles={setValidationDocument}
                            maxFiles={5}
                            label="Drag documents or click to select (Max 5)"
                            fileType="file"
                        />
                    </div>

                    <div className="form-group full-width">
                        <button className="form-button" type="submit">
                            Create Space
                        </button>
                        <button
                            type="button"
                            className="form-button secondary"
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSpace;
