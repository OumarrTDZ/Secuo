import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// using Swiper styles instead of meritxell Owl carrusel, yep
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/components/documentCarousel.css';

const DocumentCarousel = ({ documents, type, id }) => {
    const [fullscreenDoc, setFullscreenDoc] = useState(null);

    if (!documents || documents.length === 0) {
        return (
            <div className="no-docs-placeholder">
                No documents available
            </div>
        );
    }

    const getDocumentUrl = (document) => {
        // If document is null or undefined, return a default URL
        if (!document) {
            console.error('Invalid document:', document);
            return '/assets/defaultDocument.png';
        }

        const baseUrl = '';

        // If document is an object with a path property, use that
        if (typeof document === 'object' && document.path) {
            const path = document.path.startsWith('/') ? document.path : `/${document.path}`;
            return `${baseUrl}${path}`;
        }

        // Convert document to string to handle any non-string values
        const docString = String(document);

        // If it's already a full URL, return it as is
        if (docString.startsWith('http')) {
            return docString;
        }

        // If it's a full local file path, extract just the relative path from 'uploads/'
        if (docString.includes('uploads')) {
            const uploadPath = docString.split('uploads/')[1];
            return `${baseUrl}/uploads/${uploadPath}`;
        }

        // If it's already a relative path starting with /uploads, just add the base URL
        if (docString.startsWith('/uploads/')) {
            return `${baseUrl}${docString}`;
        }

        // Otherwise, construct the URL based on the type
        switch (type) {
            case 'space':
                return `${baseUrl}/uploads/spaces/${id}/validationDocument/${docString}`;
            case 'contract':
                return `${baseUrl}/uploads/contracts/${id}/contractDocument/${docString}`;
            case 'user':
                // Extract just the filename if a full path is provided
                const filename = docString.split('/').pop();
                return `${baseUrl}/uploads/users/${id}/${docString.includes('idfront') ? 'idfront' : 'idback'}/${filename}`;
            default:
                return `${baseUrl}${docString}`;
        }
    };

    const isImageFile = (document) => {
        if (!document) return false;

        // If document is an object with a path property, use that
        const filename = typeof document === 'object' && document.path
            ? document.path
            : String(document);

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const ext = '.' + filename.split('.').pop().toLowerCase();
        return imageExtensions.includes(ext);
    };

    const getFileIcon = (document) => {
        if (!document) return '📎';

        // If document is an object with a path property, use that
        const filename = typeof document === 'object' && document.path
            ? document.path
            : String(document);

        const ext = filename.split('.').pop().toLowerCase();
        switch (ext) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'odt':
                return '📋';
            case 'txt':
            case 'rtf':
                return '📃';
            default:
                return '📎';
        }
    };

    const getFileType = (document) => {
        if (!document) return 'Document';

        // If document is an object with a path property, use that
        const filename = typeof document === 'object' && document.path
            ? document.path
            : String(document);

        const ext = filename.split('.').pop().toLowerCase();
        switch (ext) {
            case 'pdf':
                return 'PDF Document';
            case 'doc':
            case 'docx':
                return 'Word Document';
            case 'odt':
                return 'OpenDocument Text';
            case 'txt':
                return 'Text File';
            case 'rtf':
                return 'Rich Text Document';
            default:
                return 'Document';
        }
    };

    const handleDocumentClick = (doc) => {
        if (isImageFile(doc)) {
            setFullscreenDoc(getDocumentUrl(doc));
        }
    };

    return (
        <>
            <div className="document-carousel-container">
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={10}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    loop={documents.length > 1}
                    className="document-swiper"
                >
                    {documents.map((doc, index) => {
                        const docUrl = getDocumentUrl(doc);
                        const isImage = isImageFile(doc);

                        return (
                            <SwiperSlide key={index}>
                                <div className="document-item">
                                    {isImage ? (
                                        <>
                                            <img
                                                src={docUrl}
                                                alt={`Document ${index + 1}`}
                                                className="document-preview"
                                                onClick={() => handleDocumentClick(doc)}
                                                onError={(e) => {
                                                    console.error('Document failed to load:', {
                                                        attemptedUrl: docUrl,
                                                        originalDoc: doc,
                                                        id
                                                    });
                                                    e.target.style.backgroundColor = '#f5f5f5';
                                                    e.target.style.padding = '20px';
                                                    e.target.src = '/assets/defaultDocument.png';
                                                }}
                                            />
                                            <div className="document-overlay">
                                                <span>Click to view</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="document-download">
                                            <div className="document-icon">
                                                {getFileIcon(doc)}
                                            </div>
                                            <div className="document-info">
                                                <span className="document-type">{getFileType(doc)}</span>
                                                <a
                                                    href={docUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="download-button"
                                                >
                                                    View Document
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>

            {fullscreenDoc && (
                <div className="fullscreen-overlay" onClick={() => setFullscreenDoc(null)}>
                    <div className="fullscreen-content">
                        <img
                            src={fullscreenDoc}
                            alt="Full size document"
                            className="fullscreen-document"
                        />
                        <button
                            className="close-fullscreen"
                            onClick={() => setFullscreenDoc(null)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default DocumentCarousel; 
