// src/components/ReusableDropzone.jsx
import { useDropzone } from "react-dropzone";
import { useState, useEffect } from "react";
import "../styles/components/reusableDropzone.css";

const ReusableDropzone = ({ label, onFileAccepted, existingFileUrl }) => {
    // State to hold the preview URL of the selected or existing file
    const [preview, setPreview] = useState(null);

    // Setup react-dropzone with image file acceptance and single file upload
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "image/*": [] }, // Accept only images
        multiple: false,            // Single file only
        onDrop: files => {
            const file = files[0];
            setPreview(URL.createObjectURL(file)); // Create preview for new file
            onFileAccepted(file);                   // Notify parent with the selected file
        }
    });

    // Effect to set initial preview if there's already an existing image URL
    useEffect(() => {
        if (existingFileUrl) setPreview(`http://localhost:5000${existingFileUrl}`);
    }, [existingFileUrl]);

    return (
        <div className="dz-wrapper">
            <p className="dz-label">{label}</p>
            {/* Dropzone area */}
            <div {...getRootProps({ className: "dz-area" })}>
                <input {...getInputProps()} />
                {preview ? (
                    <img src={preview} alt="preview" className="dz-img" />
                ) : (
                    <p>{isDragActive ? "📂 Drop here..." : "Drag the file or click here"}</p>
                )}
            </div>
        </div>
    );
};

export default ReusableDropzone;
