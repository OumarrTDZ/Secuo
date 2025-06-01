const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { documentFileFilter, imageFileFilter } = require('./fileValidation');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dni = req.params.dni || req.body.dni;
        if (!dni) {
            return cb(new Error('DNI parameter is required'));
        }

        let subfolder;
        switch (file.fieldname) {
            case 'profilePhoto':
                subfolder = 'profilephoto';
                break;
            case 'dniFrontPhoto':
            case 'dniBackPhoto':
                subfolder = file.fieldname.toLowerCase();
                break;
            default:
                return cb(new Error('Invalid field name'));
        }

        const uploadPath = path.join(__dirname, '..', 'uploads', 'users', dni, subfolder);

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
    if (file.fieldname === 'profilePhoto') {
        imageFileFilter(req, file, cb);
    } else if (['dniFrontPhoto', 'dniBackPhoto'].includes(file.fieldname)) {
        documentFileFilter(req, file, cb);
    } else {
        cb(new Error('Invalid field name'));
    }
};

const uploadUserFiles = multer({ 
    storage,
    fileFilter
});

module.exports = { uploadUserFiles }; 