const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { documentFileFilter, imageFileFilter } = require('./fileValidation');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { spaceId } = req.params;

        if (!spaceId) {
            return cb(new Error('spaceId parameter is required'));
        }

        // Determine subfolder based on the fieldname
        let subfolder;
        switch (file.fieldname) {
            case 'gallery':
                subfolder = 'gallery';
                break;
            case 'validationDocuments':
                subfolder = 'validationDocument';
                break;
            default:
                return cb(new Error('Invalid field name'));
        }

        // Construct upload directory path with 'spaces' parent directory
        const uploadPath = path.join(__dirname, '..', 'uploads', 'spaces', spaceId, subfolder);

        // Ensure the directory exists
        try {
            fs.mkdirSync(uploadPath, { recursive: true });
        } catch (error) {
            return cb(error);
        }

        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const safeFieldname = file.fieldname.replace(/\s+/g, '_');
        cb(null, `${timestamp}-${safeFieldname}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'gallery') {
        imageFileFilter(req, file, cb);
    } else if (file.fieldname === 'validationDocuments') {
        documentFileFilter(req, file, cb);
    } else {
        cb(new Error('Invalid field name'));
    }
};

const uploadSpaceFiles = multer({ 
    storage,
    fileFilter
});

module.exports = { uploadSpaceFiles };
