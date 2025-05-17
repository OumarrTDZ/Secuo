import { useDropzone } from 'react-dropzone';
import '../styles/dropzone.css';

const ImageDropZone = ({ files, setFiles, maxFiles, label, fileType }) => {
    // Called when files are dropped or selected
    const onDrop = (acceptedFiles) => {
        const totalFiles = [...files, ...acceptedFiles];
        // Check if the total files exceed max allowed
        if (totalFiles.length <= maxFiles) {
            setFiles(totalFiles);
        } else {
            alert(`Maximum ${maxFiles} files allowed.`);
        }
    };

    // Remove file at specified index from the current files array
    const handleRemove = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    // Setup react-dropzone hooks with appropriate file acceptance rules
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        // Accept images or specifically .jpg files based on fileType prop
        accept: fileType === 'image' ? 'image/*' : '.jpg',
        multiple: true,
    });

    return (
        <div className="dropzone-container">
            {/* Dropzone area */}
            <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <p>{label}</p>
            </div>

            {/* Preview list of selected files */}
            <div className="preview-list">
                {files.map((file, index) => (
                    <div key={index} className="preview-item">
                        <div className="preview-content">
                            {/* Show image preview if fileType is 'image', otherwise show file icon */}
                            {fileType === 'image' ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="preview"
                                    className="preview-img"
                                />
                            ) : (
                                <div className="preview-file">
                                    <i className="fas fa-file-pdf"></i>
                                    <span>{file.name}</span>
                                </div>
                            )}
                        </div>
                        {/* Button to remove this file */}
                        <button
                            className="remove-btn"
                            onClick={() => handleRemove(index)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageDropZone;
