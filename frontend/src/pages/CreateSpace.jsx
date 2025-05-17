import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/pages/createSpace.css';
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
        monthlyPrice: '',
        salePrice: '',
        ownerDni: '',
    });

    const [gallery, setGallery] = useState([]);
    const [validationDocuments, setValidationDocuments] = useState([]);
    const [message, setMessage] = useState('');
    const [token, setToken] = useState(localStorage.getItem('token'));
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

        if (!formData.spaceType || !formData.squareMeters || !formData.ownerDni || !formData.monthlyPrice || validationDocuments.length === 0) {
            return alert("Please complete all required fields and upload at least one validation document.");
        }

        try {
            const spaceRes = await axios.post(
                'http://localhost:5000/api/spaces',
                { ...formData, ownerDni: userDni },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { _id: spaceId } = spaceRes.data.space;

            const filesData = new FormData();
            gallery.forEach(file => filesData.append('gallery', file));
            validationDocuments.forEach(file => filesData.append('validationDocument', file));

            await axios.post(
                `http://localhost:5000/api/spaces/${spaceId}/upload`,
                filesData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage('Space successfully created and files uploaded.');

            setFormData({
                spaceType: 'APARTMENT',
                floor: '',
                door: '',
                squareMeters: '',
                rooms: '',
                marking: '',
                description: '',
                status: 'AVAILABLE',
                monthlyPrice: '',
                salePrice: '',
                ownerDni: userDni,
            });
            setGallery([]);
            setValidationDocuments([]);

            setTimeout(() => navigate('/dashboard-owner'), 1500);
        } catch (error) {
            console.error(error);
            setMessage('There was an error creating the space or uploading the files.');
        }
    };

    return (
        <div className="create-space-container">
            <h2>Create New Rental Space</h2>
            <form className="space-form" onSubmit={handleSubmit}>
                <label>
                    Space Type:
                    <select name="spaceType" value={formData.spaceType} onChange={handleChange}>
                        <option value="APARTMENT">Apartment</option>
                        <option value="GARAGE">Garage</option>
                    </select>
                </label>

                <input name="marking" type="text" placeholder="Space Name" value={formData.marking} onChange={handleChange} />
                <input name="floor" type="number" placeholder="Floor" value={formData.floor} onChange={handleChange} />
                <input name="door" type="text" placeholder="Door" value={formData.door} onChange={handleChange} />
                <input name="squareMeters" type="number" placeholder="Square Meters *" value={formData.squareMeters} onChange={handleChange} required />
                <input name="rooms" type="number" placeholder="Rooms" value={formData.rooms} onChange={handleChange} />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />

                <label>
                    Status:
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="AVAILABLE">Available</option>
                        <option value="OCCUPIED">Occupied</option>
                        <option value="MAINTENANCE">Under Maintenance</option>
                    </select>
                </label>

                <input name="monthlyPrice" type="number" placeholder="Monthly Price *" value={formData.monthlyPrice} onChange={handleChange} />

                <label>
                    Image Gallery:
                    <ImageDropZone
                        files={gallery}
                        setFiles={setGallery}
                        maxFiles={10}
                        label="Drag images or click to select (Max 10)"
                        fileType="image"
                    />
                </label>

                <label>
                    Property Validation Documents:
                    <ImageDropZone
                        files={validationDocuments}
                        setFiles={setValidationDocuments}
                        maxFiles={5}
                        label="Drag documents or click to select (Max 5)"
                        fileType="file"
                    />
                </label>

                <button className="button-create-space" type="submit">Create Space</button>
                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate('/dashboard-owner')}
                >
                    Back to Dashboard
                </button>

                {message && <p className="message">{message}</p>}
            </form>
        </div>
    );
};

export default CreateSpace;
