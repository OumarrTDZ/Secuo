import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import ImageDropZone from "../components/ImageDropZone.jsx";

const CreateContract = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const spaceId = params.get('spaceId');

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [ownerDni, setOwnerDni] = useState(localStorage.getItem('dni'));

    const [formData, setFormData] = useState({
        tenantDni: '',
        contractType: 'RENT',
        startDate: '',
        endDate: '',
        monthlyPayment: '',
        initialPayment: ''
    });

    const [contractDocuments, setContractDocuments] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token || !ownerDni) {
            setMessage("You must be logged in to create a contract.");
        }
    }, [token, ownerDni]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!spaceId || !formData.tenantDni || !formData.startDate || !formData.endDate || !formData.monthlyPayment || contractDocuments.length === 0) {
            return alert("Please fill in all required fields and upload at least one contract document.");
        }

        try {
            //create a contraact without file
            const res = await axios.post(
                'http://localhost:5000/api/contracts',
                { ...formData, spaceId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const contractId = res.data.contract._id;

            // upload file
            const filesData = new FormData();
            contractDocuments.forEach(file => filesData.append('contractDocument', file));

            await axios.post(
                `http://localhost:5000/api/contracts/${contractId}/upload`,
                filesData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage("Contract created and documents uploaded successfully.");
            setTimeout(() => navigate('/dashboard-owner'), 1500);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.error); //
            } else {
                console.error("Unexpected error:", error);
                alert("An unexpected error occurred while creating the contract.");
            }
        }
    };

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Create Contract</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="tenantDni" placeholder="Tenant DNI *" type="text" onChange={handleChange} required className="w-full p-2 border rounded" />
                <select name="contractType" onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="RENT">Rent</option>
                    <option value="SALE">Sale</option>
                </select>
                <input name="startDate" type="date" onChange={handleChange} required className="w-full p-2 border rounded" />
                <input name="endDate" type="date" onChange={handleChange} required className="w-full p-2 border rounded" />
                <input name="monthlyPayment" type="number" placeholder="Monthly Payment *" onChange={handleChange} required className="w-full p-2 border rounded" />
                <input name="initialPayment" type="number" placeholder="Initial Payment" onChange={handleChange} className="w-full p-2 border rounded" />

                <label className="block">
                    Contract Documents (PDF/Images):
                    <ImageDropZone
                        files={contractDocuments}
                        setFiles={setContractDocuments}
                        maxFiles={5}
                        label="Drag documents or click to select (Max 5)"
                        fileType="file"
                    />
                </label>

                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
                    Save Contract
                </button>

                {message && <p className="text-center text-sm text-blue-600 mt-2">{message}</p>}
            </form>
        </div>
    );
};

export default CreateContract;
