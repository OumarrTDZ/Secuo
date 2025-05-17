const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
            case 'validationDocument':
                subfolder = 'validationDocument';
                break;
            default:
                subfolder = 'misc';
        }

        // Construct upload directory path
        const uploadPath = path.join(__dirname, '..', 'uploads', spaceId, subfolder);

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

const uploadSpaceFiles = multer({ storage });

module.exports = { uploadSpaceFiles };
