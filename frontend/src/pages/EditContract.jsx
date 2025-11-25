import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from "../api";
import ImageDropZone from '../components/ImageDropZone';
import '../styles/components/forms.css';
import { FiTrash2, FiDownload } from 'react-icons/fi';

const EditContract = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [spaceId, setSpaceId] = useState(null);
    const [formData, setFormData] = useState({
        contractType: '',
        startDate: '',
        endDate: '',
        monthlyPayment: '',
        contractStatus: 'ACTIVE',
        tenantDni: ''
    });
    const [existingDocuments, setExistingDocuments] = useState([]);
    const [newDocuments, setNewDocuments] = useState([]);
    const [message, setMessage] = useState('');
    const [token] = useState(localStorage.getItem('userToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContract = async () => {
            if (!id) {
                console.error('No contract ID provided');
                setMessage('Error: No contract ID provided');
                setLoading(false);
                return;
            }

            if (!token) {
                console.error('No authentication token found');
                setMessage('Error: Please log in again');
                navigate('/login');
                return;
            }

            try {
                console.log('Fetching contract with ID:', id);
                
                const response = await api.get(
                    `/api/contracts/${id}`,
                    { 
                        headers: { 
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log('API Response:', response);

                if (!response.data) {
                    throw new Error('No data received from server');
                }

                const contract = response.data;
                console.log('Contract data:', contract);

                if (!contract) {
                    throw new Error('Contract not found');
                }

                // Store the spaceId for later use in navigation
                setSpaceId(contract.spaceId);

                // Format dates to YYYY-MM-DD for input fields
                const formatDate = (dateString) => {
                    if (!dateString) return '';
                    try {
                        const date = new Date(dateString);
                        if (isNaN(date.getTime())) return '';
                        return date.toISOString().split('T')[0];
                    } catch (error) {
                        console.error('Error formatting date:', error);
                        return '';
                    }
                };

                const formattedData = {
                    contractType: contract.contractType || '',
                    startDate: formatDate(contract.startDate),
                    endDate: formatDate(contract.endDate),
                    monthlyPayment: contract.monthlyPayment || '',
                    contractStatus: contract.contractStatus || 'ACTIVE',
                    tenantDni: contract.tenantDni || ''
                };

                console.log('Setting form data:', formattedData);
                setFormData(formattedData);

                if (contract.contractDocument) {
                    console.log('Contract documents:', contract.contractDocument);
                    const processedDocs = contract.contractDocument.map(doc => {
                        // If doc is a string (legacy format), convert it to an object
                        if (typeof doc === 'string') {
                            const fileName = doc.split('/').pop();
                            return {
                                path: doc,
                                originalName: fileName,
                                _id: doc
                            };
                        }
                        return {
                            ...doc,
                            _id: doc._id || doc.path
                        };
                    });
                    
                    console.log('Processed documents:', processedDocs);
                    setExistingDocuments(processedDocs);
                }

                setMessage('');
            } catch (error) {
                console.error('Error fetching contract:', error);
                console.error('Error details:', {
                    message: error.message,
                    response: error.response,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });

                if (error.response?.status === 404) {
                    setMessage('Contract not found');
                    navigate('/dashboard-owner');
                    return;
                }

                setMessage(
                    "Error loading contract: " + 
                    (error.response?.data?.message || error.message || 'Unknown error')
                );
            } finally {
                setLoading(false);
            }
        };

        fetchContract();
    }, [id, token, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDeleteDocument = async (fileName) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            console.log('Deleting document:', fileName);
            
            // Update contract to remove the document
            await api.patch(
                `/api/contracts/${id}`,
                { documentToDelete: fileName },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update UI
            setExistingDocuments(prev => prev.filter(doc => !doc.path.includes(fileName)));
            setMessage("✅ Document deleted successfully!");
        } catch (error) {
            console.error("Error deleting document:", error);
            setMessage(error.response?.data?.message || "Error deleting document. Please try again.");
        }
    };

    const handleDownloadDocument = (documentPath) => {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = `${documentPath}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            console.log('Submitting contract update:', formData);
            
            // Update contract details
            const response = await api.patch(
                `/api/contracts/${id}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Contract update response:', response.data);

            // Upload new documents if any
            if (newDocuments.length > 0) {
                const documentsData = new FormData();
                newDocuments.forEach(file => {
                    documentsData.append('contractDocument', file);
                });

                await api.post(
                    `/api/contracts/${id}/upload`,
                    documentsData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
            }

            setMessage("✅ Contract updated successfully!");
            // Navigate back to the space details page after successful update
            setTimeout(() => {
                if (spaceId) {
                    navigate(`/space/${spaceId}`);
                } else {
                    navigate(-1); // Fallback to previous page if spaceId is not available
                }
            }, 1500);
        } catch (error) {
            console.error('Error updating contract:', error);
            console.error('Error details:', {
                response: error.response?.data,
                status: error.response?.status,
                message: error.message
            });

            let errorMessage = "An unexpected error occurred while updating the contract.";
            
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
                if (error.response.data.details) {
                    errorMessage += `: ${error.response.data.details}`;
                }
            } else if (error.response?.status === 403) {
                errorMessage = "You don't have permission to update this contract.";
            } else if (error.response?.status === 404) {
                errorMessage = "Contract not found.";
            }

            setMessage(errorMessage);
        }
    };

    if (loading) {
        return (
            <div className="form-container">
                <div className="form-wrapper">
                    <div className="loading-message">
                        Loading contract details...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <div className="form-wrapper">
                <div className="form-header">
                    <h2>Edit Contract</h2>
                    <p>Update the contract details below.</p>
                </div>

                {message && (
                    <div className={message.includes("✅") ? "success-message" : "error-message"}>
                        {message}
                    </div>
                )}

                <form className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="required">Tenant DNI</label>
                        <input 
                            name="tenantDni" 
                            type="text" 
                            value={formData.tenantDni} 
                            onChange={handleChange}
                            required 
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">Contract Type</label>
                        <select 
                            name="contractType" 
                            value={formData.contractType} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select type</option>
                            <option value="RENT">Rent</option>
                            <option value="SALE">Sale</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="required">Status</label>
                        <select 
                            name="contractStatus" 
                            value={formData.contractStatus} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select status</option>
                            <option value="ACTIVE">Active - Contract in force</option>
                            <option value="EXPIRED">Expired - Reached end date</option>
                            <option value="TERMINATED">Terminated - Ended early</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="required">Start Date</label>
                        <input 
                            name="startDate" 
                            type="date" 
                            value={formData.startDate} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">End Date</label>
                        <input 
                            name="endDate" 
                            type="date" 
                            value={formData.endDate} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">Monthly Payment (€)</label>
                        <input 
                            name="monthlyPayment" 
                            type="number" 
                            placeholder="Enter monthly payment amount"
                            value={formData.monthlyPayment} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Existing Documents</label>
                        {existingDocuments.length > 0 ? (
                            <div className="documents-list">
                                {existingDocuments.map((doc, index) => (
                                    <div key={doc._id || index} className="document-item">
                                        <span className="document-name">
                                            <span className="document-icon">📄</span>
                                            {doc.originalName || doc.path.split('/').pop()}
                                        </span>
                                        <div className="document-actions">
                                            <button
                                                type="button"
                                                className="document-action-button download"
                                                onClick={() => handleDownloadDocument(doc.path)}
                                            >
                                                <FiDownload /> Download
                                            </button>
                                            <button
                                                type="button"
                                                className="document-action-button delete"
                                                onClick={() => handleDeleteDocument(doc.path.split('/').pop())}
                                            >
                                                <FiTrash2 /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-documents">No documents attached to this contract.</p>
                        )}
                    </div>

                    <div className="form-group full-width">
                        <label>Add New Documents</label>
                        <ImageDropZone
                            files={newDocuments}
                            setFiles={setNewDocuments}
                            maxFiles={5}
                            label="Drag new documents or click to select (Max 5)"
                            fileType="file"
                        />
                    </div>

                    <div className="form-group full-width">
                        <button className="form-button" type="submit">
                            Update Contract
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

export default EditContract;

