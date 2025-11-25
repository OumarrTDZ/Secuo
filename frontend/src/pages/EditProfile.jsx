import { useState, useEffect } from "react";
import api from "../api";
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

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [newProfile, setNewProfile] = useState(null);
    const [newDniFront, setNewDniFront] = useState(null);
    const [newDniBack, setNewDniBack] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("userToken");
                const { data } = await api.get("/api/users/profile", {
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

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onPasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if ((passwordForm.newPassword || passwordForm.confirmPassword || passwordForm.currentPassword) &&
            (!passwordForm.newPassword || !passwordForm.confirmPassword || !passwordForm.currentPassword)) {
            setMessage("All password fields are required to change your password");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        try {
            const token = localStorage.getItem("userToken");
            const formData = new FormData();

            Object.keys(form).forEach(key => formData.append(key, form[key]));
            Object.keys(passwordForm).forEach(key => formData.append(key, passwordForm[key]));

            if (newProfile) formData.append('profilePhoto', newProfile);
            if (newDniFront) formData.append('idFrontPhoto', newDniFront);
            if (newDniBack) formData.append('idBackPhoto', newDniBack);

            await api.patch(`/api/users/${user._id}/edit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("✅ Profile updated successfully!");
            setTimeout(() => window.location.href = '/dashboard', 1500);
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
                        <input name="dni" value={form.dni} onChange={onChange} required placeholder="Enter your DNI" />
                    </div>

                    <div className="form-group">
                        <label className="required">First Name</label>
                        <input name="firstName" value={form.firstName} onChange={onChange} required placeholder="Enter your first name" />
                    </div>

                    <div className="form-group">
                        <label className="required">Last Name</label>
                        <input name="lastName" value={form.lastName} onChange={onChange} required placeholder="Enter your last name" />
                    </div>

                    <div className="form-group">
                        <label className="required">Email</label>
                        <input type="email" name="email" value={form.email} onChange={onChange} required placeholder="Enter your email" />
                    </div>

                    <div className="form-group">
                        <label className="required">Phone Number</label>
                        <input name="phoneNumber" value={form.phoneNumber} onChange={onChange} required placeholder="Enter your phone number" />
                    </div>

                    <div className="form-group">
                        <label className="required">Preference</label>
                        <select name="preference" value={form.preference} onChange={onChange}>
                            <option value="TENANT">Tenant</option>
                            <option value="OWNER">Owner</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={onPasswordChange} />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={onPasswordChange} />
                    </div>

                    <div className="form-group">
                        <label>Current Password</label>
                        <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={onPasswordChange} />
                    </div>

                    <div className="form-group full-width">
                        <label>Profile Photo</label>
                        <ReusableDropzone label="Update profile photo" onFileAccepted={setNewProfile} existingFileUrl={user.profilePhoto} />
                    </div>

                    <div className="form-group full-width">
                        <label>DNI Front Photo</label>
                        <ReusableDropzone label="Update DNI front photo" onFileAccepted={setNewDniFront} existingFileUrl={user.idFrontPhoto} />
                    </div>

                    <div className="form-group full-width">
                        <label>DNI Back Photo</label>
                        <ReusableDropzone label="Update DNI back photo" onFileAccepted={setNewDniBack} existingFileUrl={user.idBackPhoto} />
                    </div>

                    <div className="form-group full-width">
                        <button className="form-button" type="submit">Save Changes</button>
                        <Link to="/dashboard" className="form-button secondary">Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;

