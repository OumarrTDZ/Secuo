// Filter for document files (images, text, PDFs, etc.)
const documentFileFilter = (req, file, cb) => {
    // Allowed document extensions
    const allowedDocumentTypes = [
        // Images
        '.jpg', '.jpeg', '.png', '.gif', '.webp',
        // Documents
        '.pdf', '.doc', '.docx', '.odt',
        // Text files
        '.txt', '.rtf'
    ];

    const ext = '.' + file.originalname.split('.').pop().toLowerCase();

    if (allowedDocumentTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed types: ' + allowedDocumentTypes.join(', ') + '.'));
    }
};

// Filter for image files only
const imageFileFilter = (req, file, cb) => {
    // Allowed image extensions
    const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    const ext = '.' + file.originalname.split('.').pop().toLowerCase();

    if (allowedImageTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only image formats are allowed.'));
    }
};

module.exports = {
    documentFileFilter,
    imageFileFilter
};
