import { useState, useEffect } from "react";
import axios from "axios";
import ReusableDropzone from "../components/ReusableDropzone";
import "../styles/pages/editProfile.css";
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

        const token = localStorage.getItem("userToken");
        try {
            // Update user data
            await axios.patch(
                `http://localhost:5000/api/users/${user._id}/edit`,
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Prepare image upload if any new images selected
            const formData = new FormData();
            if (newProfile) formData.append("profilePhoto", newProfile);
            if (newDniFront) formData.append("idFrontPhoto", newDniFront);
            if (newDniBack) formData.append("idBackPhoto", newDniBack);

            if ([newProfile, newDniFront, newDniBack].some(Boolean)) {
                await axios.post(
                    `http://localhost:5000/api/users/upload-profile/${form.dni}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            alert("Profile updated successfully");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile");
        }
    };

    //error catched if brokes, i senend this instance of react error view card
    if (loading) return <p>Loading...</p>;

    return (
        <div className="ep-wrapper">
            {/* Current profile photo and delete button */}
            <div className="ep-header">
                <img
                    className="ep-avatar"
                    src={
                        user?.profilePhoto
                            ? `http://localhost:5000${user.profilePhoto}`
                            : "/assets/defaultProfile.png"
                    }
                    alt="Profile"
                />
                <button className="ep-del-btn" onClick={handleDeletePhoto}>
                    Delete photo
                </button>
            </div>

            {/* Profile edit form */}
            <form className="ep-form" onSubmit={handleSave}>
                <label>
                    DNI*
                    <input name="dni" value={form.dni} onChange={onChange} required />
                </label>
                <label>
                    First Name*
                    <input name="firstName" value={form.firstName} onChange={onChange} required />
                </label>
                <label>
                    Last Name*
                    <input name="lastName" value={form.lastName} onChange={onChange} required />
                </label>
                <label>
                    Email*
                    <input type="email" name="email" value={form.email} onChange={onChange} required />
                </label>
                <label>
                    Phone Number*
                    <input name="phoneNumber" value={form.phoneNumber} onChange={onChange} required />
                </label>
                <label>
                    Preference*
                    <select name="preference" value={form.preference} onChange={onChange}>
                        <option value="TENANT">Tenant</option>
                        <option value="OWNER">Owner</option>
                    </select>
                </label>

                {/* Image upload zones */}
                <ReusableDropzone
                    label="New profile photo"
                    onFileAccepted={setNewProfile}
                    existingFileUrl={user.profilePhoto}
                />
                <ReusableDropzone
                    label="DNI card (front)"
                    onFileAccepted={setNewDniFront}
                    existingFileUrl={user.idFrontPhoto}
                />
                <ReusableDropzone
                    label="DNI card (back)"
                    onFileAccepted={setNewDniBack}
                    existingFileUrl={user.idBackPhoto}
                />

                <button className="ep-save" type="submit">
                    Save changes
                </button>
                <Link to="/dashboard" className="ep-cancel">
                    Cancel
                </Link>
            </form>
        </div>
    );
};

export default EditProfile;

