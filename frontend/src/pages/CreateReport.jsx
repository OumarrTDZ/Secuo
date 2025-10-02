import { useState, useEffect } from 'react';
import api from "../api";
import { useNavigate, useParams } from 'react-router-dom';
import ImageDropZone from '../components/ImageDropZone';
import '../styles/components/forms.css';

const CreateReport = () => {
    const navigate = useNavigate();
    const { spaceId } = useParams();
    const [token, setToken] = useState(localStorage.getItem('userToken'));
    const [tenantDni, setTenantDni] = useState(localStorage.getItem('dni'));

    const [formData, setFormData] = useState({
        issueType: '',
        priority: 'MEDIUM',
        description: ''
    });

    const [images, setImages] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token || !tenantDni) {
            setMessage('You must be logged in to report a problem.');
        }
    }, [token, tenantDni]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.issueType || !formData.description) {
            setMessage("Please fill in all required fields.");
            return;
        }

        try {
            // Create report with spaceId in the body
            const reportResponse = await api.post(
                'http://localhost:5000/api/reports',
                { ...formData, spaceId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const reportId = reportResponse.data.report._id;

            // Upload images if any
            if (images.length > 0) {
                const imagesData = new FormData();
                images.forEach(file => {
                    imagesData.append('attachments', file);
                });

                await api.post(
                    `http://localhost:5000/api/reports/${reportId}/images`,
                    imagesData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${token}`,
                            'x-space-id': spaceId
                        }
                    }
                );
            }

            setMessage("✅ Report created successfully!");
            setTimeout(() => navigate('/dashboard-tenant'), 1500);
        } catch (error) {
            console.error(error);
            setMessage(error?.response?.data?.error || "An unexpected error occurred while creating the report.");
        }
    };

    return (
        <div className="form-container">
            <div className="form-wrapper">
                <div className="form-header">
                    <h2>Report a Problem</h2>
                    <p>Please provide details about the issue you're experiencing with the property.</p>
                </div>

                {message && (
                    <div className={message.includes("✅") ? "success-message" : "error-message"}>
                        {message}
                    </div>
                )}

                <form className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="required">Issue Type</label>
                        <select 
                            name="issueType" 
                            value={formData.issueType} 
                            onChange={handleChange} 
                            required
                        >
                            <option value="">Select Issue Type</option>
                            <option value="LEAK">Leak</option>
                            <option value="ANIMALS">Animals</option>
                            <option value="ELECTRICAL">Electrical</option>
                            <option value="STRUCTURAL">Structural</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Priority Level</label>
                        <select 
                            name="priority" 
                            value={formData.priority} 
                            onChange={handleChange}
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label className="required">Description</label>
                        <textarea 
                            name="description" 
                            placeholder="Please describe the issue in detail..."
                            value={formData.description} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Supporting Images</label>
                        <ImageDropZone
                            files={images}
                            setFiles={setImages}
                            maxFiles={5}
                            label="Drag images or click to select (Max 5)"
                            fileType="image"
                        />
                    </div>

                    <div className="form-group full-width">
                        <button className="form-button" type="submit">
                            Submit Report
                        </button>
                        <button
                            type="button"
                            className="form-button secondary"
                            onClick={() => navigate('/dashboard-tenant')}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateReport;