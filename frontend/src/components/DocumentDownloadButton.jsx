import React from 'react';
import '../styles/components/documentDownloadButton.css';

const DocumentDownloadButton = ({ documents, type, id }) => {
    if (!documents || documents.length === 0) {
        return null;
    }

    const getDocumentUrl = (document) => {
        const baseUrl = 'http://localhost:5000';
        if (document.startsWith('/uploads/')) {
            return `${baseUrl}${document}`;
        }

        switch (type) {
            case 'space':
                return `${baseUrl}/uploads/spaces/${id}/validationDocument/${document}`;
            case 'contract':
                return `${baseUrl}/uploads/contracts/${id}/contractDocument/${document}`;
            default:
                return `${baseUrl}${document}`;
        }
    };

    const downloadAllDocuments = () => {
        // Download each document
        documents.forEach((doc, index) => {
            const link = document.createElement('a');
            link.href = getDocumentUrl(doc);
            link.download = `document-${index + 1}${doc.substring(doc.lastIndexOf('.'))}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    return (
        <div className="document-download-container">
            <button 
                className="download-all-button" 
                onClick={downloadAllDocuments}
            >
                <span className="download-icon">📥</span>
                Download {type === 'space' ? 'Validation' : 'Contract'} Documents ({documents.length})
            </button>
        </div>
    );
};

export default DocumentDownloadButton; 