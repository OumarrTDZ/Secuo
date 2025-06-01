import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
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
        const baseUrl = 'http://localhost:5000';
        if (document.startsWith('/uploads/')) {
            return `${baseUrl}${document}`;
        }

        switch (type) {
            case 'space':
                return `${baseUrl}/uploads/spaces/${id}/validationDocument/${document}`;
            case 'contract':
                return `${baseUrl}/uploads/contracts/${id}/contractDocument/${document}`;
            case 'user':
                return `${baseUrl}/uploads/users/${id}/${document}`;
            default:
                return `${baseUrl}${document}`;
        }
    };

    const isImageFile = (filename) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const ext = '.' + filename.split('.').pop().toLowerCase();
        return imageExtensions.includes(ext);
    };

    const getFileIcon = (filename) => {
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

    const getFileType = (filename) => {
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