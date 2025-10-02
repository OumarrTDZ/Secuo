import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api.js';
import ImageDropZone from '../components/ImageDropZone';
import '../styles/components/forms.css';

const CreateContract = () => {
    const navigate = useNavigate();
    const { spaceId } = useParams();
    const [formData, setFormData] = useState({
        tenantDni: '',
        contractType: 'RENT',
        startDate: '',
        endDate: '',
        monthlyPayment: '',
        initialPayment: '0'
    });
    const [contractDocuments, setContractDocuments] = useState([]);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.tenantDni || !formData.startDate || !formData.endDate || !formData.monthlyPayment || formData.initialPayment === '') {
            setMessage("Please fill in all required fields.");
            return;
        }

        // Validate dates
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (start >= end) {
            setMessage("Start date must be before end date");
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                setMessage("Authentication failed. Please log in again.");
                return;
            }

            const dataToSend = {
                ...formData,
                spaceId,
                monthlyPayment: Number(formData.monthlyPayment),
                initialPayment: Number(formData.initialPayment),
                contractDocument: []
            };
            console.log('Sending contract data:', dataToSend);

            // Create contract
            const contractResponse = await api.post(
                'http://localhost:5000/api/contracts',
                dataToSend,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const contractId = contractResponse.data.contract._id;

            // Upload contract documents if any
            if (contractDocuments.length > 0) {
                const documentsData = new FormData();
                contractDocuments.forEach(file => {
                    documentsData.append('contractDocument', file);
                });

                await api.post(
                    `http://localhost:5000/api/contracts/${contractId}/upload`,
                    documentsData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
            }

            setMessage("✅ Contract created successfully!");
            setTimeout(() => navigate(`/space/${spaceId}`), 1500);
        } catch (error) {
            console.error('Error details:', {
                response: error.response?.data,
                status: error.response?.status,
                data: error.response?.data?.error
            });

            // Display specific message depending on the error
            if (error.response?.status === 403) {
                setMessage("You are not authorized to create contracts for this space.");
            } else if (error.response?.status === 404) {
                setMessage("The space was not found. Please try again.");
            } else if (error.response?.status === 400 && error.response?.data?.error) {
                setMessage(error.response.data.error);
            } else {
                setMessage("An unexpected error occurred while creating the contract.");
            }
        }
    };

    return (
        <div className="form-container">
            <div className="form-wrapper">
                <div className="form-header">
                    <h2>Create New Contract</h2>
                    <p>Fill in the contract details below to formalize the rental agreement.</p>
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
                            placeholder="Enter tenant's DNI"
                            value={formData.tenantDni} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">Contract Type</label>
                        <select 
                            name="contractType" 
                            value={formData.contractType} 
                            onChange={handleChange}
                        >
                            <option value="RENT">Rent</option>
                            <option value="SALE">Sale</option>
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

                    <div className="form-group">
                        <label className="required">Initial Payment (€)</label>
                        <input 
                            name="initialPayment" 
                            type="number" 
                            placeholder="Enter initial payment amount"
                            value={formData.initialPayment} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Contract Documents</label>
                        <ImageDropZone
                            files={contractDocuments}
                            setFiles={setContractDocuments}
                            maxFiles={5}
                            label="Drag documents or click to select (Max 5)"
                            fileType="file"
                        />
                    </div>

                    <div className="form-group full-width">
                        <button className="form-button" type="submit">
                            Create Contract
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

export default CreateContract;
