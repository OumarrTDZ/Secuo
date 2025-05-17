import { useState } from "react";
import { useDropzone } from "react-dropzone";
import "../styles/components/profilePhotoMenu.css";
import axios from "axios";

const ProfilePhotoMenu = ({ user, onUpdate, onClose }) => {
    // State to hold the new selected photo file
    const [newPhoto, setNewPhoto] = useState(null);
    // State to hold the preview URL for the selected photo
    const [previewUrl, setPreviewUrl] = useState(null);

    // Function called when user drops or selects files
    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        setNewPhoto(file);
        setPreviewUrl(URL.createObjectURL(file)); // Create preview URL for image
    };

    // Upload the selected photo to the backend
    const handleUpload = async () => {
        if (!newPhoto) return;

        const formData = new FormData();
        formData.append("profilePhoto", newPhoto);

        try {
            const token = localStorage.getItem("userToken"); // 🔐 Auth token from login
            await axios.post(
                `http://localhost:5000/api/users/upload-profile/${user.dni}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    },
                }
            );
            onUpdate();  // Refresh user data after upload
            onClose();   // Close the menu
        } catch (err) {
            console.error(" Error uploading image:", err);
        }
    };

    // Delete the user's current profile photo
    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("userToken");
            await axios.delete(
                `http://localhost:5000/api/users/${user._id}/profilePhoto`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                }
            );
            onUpdate(); // Refresh user data after delete
            onClose();  // Close the menu
        } catch (err) {
            console.error(" Error deleting image:", err);
        }
    };

    // Setup dropzone with accepted image types
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { "image/*": [] }
    });

    return (
        <div className="photo-menu">
            {/* Dropzone area for drag & drop or click to select */}
            <div className="dropzone" {...getRootProps()}>
                <input {...getInputProps()} />
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="preview" />
                ) : (
                    <p>📤 Drag or click to select an image</p>
                )}
            </div>

            {/* Buttons to cancel or accept upload */}
            <div className="buttons-row">
                <button className="btn cancel" onClick={onClose}>Cancel</button>
                <button className="btn accept" onClick={handleUpload} disabled={!newPhoto}>Accept</button>
            </div>

            {/* Button to delete current profile photo */}
            <button className="btn delete" onClick={handleDelete}>Delete Photo</button>
        </div>
    );
};

export default ProfilePhotoMenu;
