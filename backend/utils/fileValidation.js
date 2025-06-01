const documentFileFilter = (req, file, cb) => {
    // Allowed document extensions
    const allowedDocumentTypes = [
        // Images
        '.jpg', '.jpeg', '.png', '.gif',
        // Documents
        '.pdf', '.doc', '.docx', '.odt',
        // Text files
        '.txt', '.rtf'
    ];

    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    
    if (allowedDocumentTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed types: ' + allowedDocumentTypes.join(', ')));
    }
};

const imageFileFilter = (req, file, cb) => {
    // Allowed image extensions
    const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    
    if (allowedImageTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'));
    }
};

module.exports = {
    documentFileFilter,
    imageFileFilter
}; 