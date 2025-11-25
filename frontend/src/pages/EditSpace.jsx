import { useState, useEffect } from 'react';
import api from "../api";
import '../styles/pages/createSpace.css';
import '../styles/components/forms.css';
import { useNavigate, useParams } from 'react-router-dom';
import ImageDropZone from "../components/ImageDropZone.jsx";

const EditSpace = () => {
    const navigate = useNavigate();
    const { id } = useParams();

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
    const [existingGallery, setExistingGallery] = useState([]);
    const [validationDocument, setValidationDocument] = useState([]);
    const [existingValidationDocs, setExistingValidationDocs] = useState([]);
    const [message, setMessage] = useState('');
    const [token] = useState(localStorage.getItem('userToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpaceDetails = async () => {
            if (!token) {
                setMessage('You must be logged in to access this page.');
                navigate('/login');
                return;
            }

            try {
                const response = await api.get(`/api/spaces/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const space = response.data.space;
                
                setFormData({
                    spaceType: space.spaceType || 'APARTMENT',
                    floor: space.floor || '',
                    door: space.door || '',
                    squareMeters: space.squareMeters || '',
                    rooms: space.rooms || '',
                    marking: space.marking || '',
                    description: space.description || '',
                    status: space.status || 'AVAILABLE',
                    ownerDni: space.ownerDni || '',
                    municipality: space.municipality || '',
                    city: space.city || '',
                    address: space.address || '',
                    postalCode: space.postalCode || ''
                });

                if (space.gallery) {
                    setExistingGallery(space.gallery);
                }

                if (space.validationDocuments) {
                    setExistingValidationDocs(space.validationDocuments);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching space details:', error);
                setMessage('Error loading space details. Please try again.');
                setLoading(false);
            }
        };

        fetchSpaceDetails();
    }, [id, token, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDeleteImage = async (imagePath) => {
        try {
            await api.patch(`/api/spaces/${id}`, {
                imageToDelete: imagePath
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setExistingGallery(prev => prev.filter(img => img !== imagePath));
            setMessage('✅ Image deleted successfully');
        } catch (error) {
            setMessage('Error deleting image');
        }
    };

    const handleDeleteDocument = async (docPath) => {
        try {
            await api.patch(`/api/spaces/${id}`, {
                documentToDelete: docPath
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setExistingValidationDocs(prev => prev.filter(doc => doc !== docPath));
            setMessage('✅ Document deleted successfully');
        } catch (error) {
            setMessage('Error deleting document');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            return setMessage("Authentication failed. Please log in again.");
        }

        try {
            // Update space details
            await api.patch(`/api/spaces/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Upload new files if any
            if (gallery.length > 0 || validationDocument.length > 0) {
                const uploadData = new FormData();
                
                gallery.forEach(file => {
                    uploadData.append('gallery', file);
                });

                validationDocument.forEach(file => {
                    uploadData.append('validationDocuments', file);
                });

                await api.post(`/api/spaces/${id}/upload`, uploadData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    }
                });
            }

            setMessage("✅ Space updated successfully!");
            setTimeout(() => navigate(-1), 1500);
        } catch (error) {
            console.error(error);
            setMessage(error?.response?.data?.error || "An unexpected error occurred while updating the space.");
        }
    };

    if (loading) {
        return <div className="loading-message">Loading space details...</div>;
    }

    return (
        <div className="form-container">
            <div className="form-wrapper">
                <div className="form-header">
                    <h2>Edit Space</h2>
                    <p>Update your property details below.</p>
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

                    {existingGallery.length > 0 && (
                        <div className="form-group full-width">
                            <label>Current Images</label>
                            <div className="existing-images">
                                {existingGallery.map((image, index) => (
                                    <div key={index} className="existing-image">
                                        <img src={`${image}`} alt={`Space ${index + 1}`} />
                                        <button 
                                            type="button" 
                                            onClick={() => handleDeleteImage(image)}
                                            className="delete-image-btn"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="form-group full-width">
                        <label>Add New Images</label>
                        <ImageDropZone
                            files={gallery}
                            setFiles={setGallery}
                            maxFiles={10}
                            label="Drag new images or click to select (Max 10)"
                            fileType="image"
                        />
                    </div>

                    {existingValidationDocs.length > 0 && (
                        <div className="form-group full-width">
                            <label>Current Validation Documents</label>
                            <div className="existing-documents">
                                {existingValidationDocs.map((doc, index) => (
                                    <div key={index} className="existing-document">
                                        <span>{doc.split('/').pop()}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => handleDeleteDocument(doc)}
                                            className="delete-document-btn"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="form-group full-width">
                        <label>Add New Validation Documents</label>
                        <ImageDropZone
                            files={validationDocument}
                            setFiles={setValidationDocument}
                            maxFiles={5}
                            label="Drag new documents or click to select (Max 5)"
                            fileType="file"
                        />
                    </div>

                    <div className="form-group full-width">
                        <button className="form-button" type="submit">
                            Update Space
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

export default EditSpace;
