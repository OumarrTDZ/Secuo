const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get DNI from body or params
        const dni = req.body.dni || req.params.dni;
        if (!dni) {
            return cb(new Error("DNI must be provided in request body or params"));
        }

        // Base directory for uploads per user DNI, now inside 'users' directory
        const baseDir = path.join(__dirname, '..', 'uploads', 'users', dni);

        // Determine subfolder by field name
        let subfolder;
        switch (file.fieldname) {
            case 'idFrontPhoto':
                subfolder = 'idfront';
                break;
            case 'idBackPhoto':
                subfolder = 'idback';
                break;
            case 'profilePhoto':
                subfolder = 'profilephoto';
                break;
            default:
                subfolder = 'misc';
        }

        // Full upload path
        const uploadPath = path.join(baseDir, subfolder);

        // Ensure directory exists, recursively create if needed
        try {
            fs.mkdirSync(uploadPath, { recursive: true });
        } catch (err) {
            return cb(err);
        }

        // Pass the upload path to multer
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        // Use a timestamp + original file extension to avoid conflicts
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });

module.exports = { upload };
