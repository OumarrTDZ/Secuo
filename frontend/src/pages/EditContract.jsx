import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/pages/editContract.css"

const EditContract = () => {
    const { contractId } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        contractType: "",
        startDate: "",
        endDate: "",
        monthlyPayment: "",
        contractStatus: "",
    });

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const token = localStorage.getItem("userToken");
                if (!token) {
                    // If no token is found, redirect to login page.
                    alert("Access denied. Please log in.");
                    return navigate("/login");
                }

                const { data } = await axios.get(`http://localhost:5000/api/contracts/${contractId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!data) {
                    alert("Contract not found.");
                    return navigate(-1); // Go back to the previous page
                }

                setContract(data);
                setFormData({
                    contractType: data.contractType || "",
                    // Trim datetime to date format yyyy-mm-dd for inputs
                    startDate: data.startDate?.substring(0, 10) || "",
                    endDate: data.endDate?.substring(0, 10) || "",
                    monthlyPayment: data.monthlyPayment || "",
                    contractStatus: data.contractStatus || "",
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching contract:", error);
                alert("Failed to load contract data.");
                navigate(-1);
            }
        };

        fetchContract();
    }, [contractId, navigate]);

    // Handle input changes and update form data state
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Submit the updated contract data to the API
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const token = localStorage.getItem("userToken");
            if (!token) {
                alert("Access denied. Please log in.");
                return navigate("/login");
            }

            await axios.patch(`http://localhost:5000/api/contracts/${contractId}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Contract updated successfully.");
            navigate(-1); // Return to previous page
        } catch (error) {
            console.error("Error updating contract:", error.response?.data || error.message);
            alert("Failed to update contract: " + (error.response?.data?.error || "Unknown error"));
        }
    };

    if (loading) return <p>Loading contract data...</p>;

    return (
        <div className="form-container">
            <h2>Edit Contract</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Contract Type:
                    <input
                        name="contractType"
                        value={formData.contractType}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Start Date:
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    End Date:
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Monthly Payment (€):
                    <input
                        name="monthlyPayment"
                        type="number"
                        min="0"
                        value={formData.monthlyPayment}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Status:
                    <select
                        name="contractStatus"
                        value={formData.contractStatus}
                        onChange={handleChange}
                        required
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="TERMINATED">Terminated</option>
                    </select>
                </label>
                <button type="submit">Save changes</button>
            </form>
        </div>
    );
};

export default EditContract;
