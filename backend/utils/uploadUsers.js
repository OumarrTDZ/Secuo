const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dni = req.body.dni;
        if (!dni) {
            return cb(new Error('DNI is required'));
        }

        // Set storage destination based on file type
        let destination = '';
        switch (file.fieldname) {
            case 'idFrontPhoto':
                destination = path.join('public/uploads/users', dni, 'idfront');
                break;
            case 'idBackPhoto':
                destination = path.join('public/uploads/users', dni, 'idback');
                break;
            case 'profilePhoto':
                destination = path.join('public/uploads/users', dni, 'profilephoto');
                break;
            default:
                destination = path.join('public/uploads/users', dni, 'misc');
        }

        // Create directory if it doesn't exist
        fs.mkdirSync(destination, { recursive: true });
        cb(null, destination);
    },
    filename: function (req, file, cb) {
        // Generate a unique filename with timestamp
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${timestamp}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Export the configured multer middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload; 