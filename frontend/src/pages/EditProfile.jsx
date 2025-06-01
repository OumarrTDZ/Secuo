import { useState, useEffect } from "react";
import axios from "axios";
import ReusableDropzone from "../components/ReusableDropzone";
import "../styles/components/forms.css";
import { Link, useNavigate } from "react-router-dom";

const EditProfile = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        dni: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        preference: "TENANT",
    });

    // Optional new images to upload
    const [newProfile, setNewProfile] = useState(null);
    const [newDniFront, setNewDniFront] = useState(null);
    const [newDniBack, setNewDniBack] = useState(null);
    const [message, setMessage] = useState('');

    // Fetch user profile on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("userToken");
                const { data } = await axios.get("http://localhost:5000/api/users/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(data.user);
                setForm({
                    dni: data.user.dni,
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                    email: data.user.email,
                    phoneNumber: data.user.phoneNumber,
                    preference: data.user.preference,
                });
            } catch (error) {
                console.error(error);
                setMessage("Error fetching profile data.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Update form state on input change
    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    //FIXPOINT -  when i add profilephoto and DNI photo, i get a error "Failed to save profile"
    // i have to manage betterh the dni change, only appplyes when de admin validate, bc in other
    // way the user loses all dependecies(pripiertys) bc all works with the DNI, or render it, to busy to do

    // Delete current profile photo
    const handleDeletePhoto = async () => {
        if (!user?.profilePhoto) return;

        const token = localStorage.getItem("userToken");
        try {
            await axios.delete(`http://localhost:5000/api/users/${user._id}/profilePhoto`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser((prev) => ({ ...prev, profilePhoto: null }));
        } catch (error) {
            console.error("Failed to delete photo:", error);
        }
    };

    const navigate = useNavigate();

    // Save profile changes, including optional image uploads
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("userToken");
            const formData = new FormData();

            // Append basic form data
            Object.keys(form).forEach(key => {
                formData.append(key, form[key]);
            });

            // Append new photos if they exist
            if (newProfile) formData.append('profilePhoto', newProfile);
            if (newDniFront) formData.append('idFrontPhoto', newDniFront);
            if (newDniBack) formData.append('idBackPhoto', newDniBack);

            await axios.put(
                "http://localhost:5000/api/users/profile",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage("✅ Profile updated successfully!");
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (error) {
            console.error(error);
            setMessage(error?.response?.data?.error || "An unexpected error occurred while updating your profile.");
        }
    };

    if (loading) {
        return (
            <div className="form-container">
                <div className="form-wrapper">
                    <div className="form-header">
                        <h2>Loading...</h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <div className="form-wrapper">
                <div className="form-header">
                    <h2>Edit Profile</h2>
                    <p>Update your personal information and documents below.</p>
                </div>

                {message && (
                    <div className={message.includes("✅") ? "success-message" : "error-message"}>
                        {message}
                    </div>
                )}

                <form className="form-grid" onSubmit={handleSave}>
                    <div className="form-group">
                        <label className="required">DNI</label>
                        <input 
                            name="dni" 
                            value={form.dni} 
                            onChange={onChange} 
                            required 
                            placeholder="Enter your DNI"
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">First Name</label>
                        <input 
                            name="firstName" 
                            value={form.firstName} 
                            onChange={onChange} 
                            required 
                            placeholder="Enter your first name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">Last Name</label>
                        <input 
                            name="lastName" 
                            value={form.lastName} 
                            onChange={onChange} 
                            required 
                            placeholder="Enter your last name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={form.email} 
                            onChange={onChange} 
                            required 
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">Phone Number</label>
                        <input 
                            name="phoneNumber" 
                            value={form.phoneNumber} 
                            onChange={onChange} 
                            required 
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">Preference</label>
                        <select 
                            name="preference" 
                            value={form.preference} 
                            onChange={onChange}
                        >
                            <option value="TENANT">Tenant</option>
                            <option value="OWNER">Owner</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Profile Photo</label>
                        <ReusableDropzone
                            label="Update profile photo"
                            onFileAccepted={setNewProfile}
                            existingFileUrl={user.profilePhoto}
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>DNI Front Photo</label>
                        <ReusableDropzone
                            label="Update DNI front photo"
                            onFileAccepted={setNewDniFront}
                            existingFileUrl={user.idFrontPhoto}
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>DNI Back Photo</label>
                        <ReusableDropzone
                            label="Update DNI back photo"
                            onFileAccepted={setNewDniBack}
                            existingFileUrl={user.idBackPhoto}
                        />
                    </div>

                    <div className="form-group full-width">
                        <button className="form-button" type="submit">
                            Save Changes
                        </button>
                        <Link to="/dashboard" className="form-button secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;

