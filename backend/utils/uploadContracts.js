const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { contractId } = req.params;

        if (!contractId) {
            return cb(new Error('contractId parameter is required'));
        }

        let subfolder;
        switch (file.fieldname) {
            case 'contractDocument':
                subfolder = 'contractDocument';
                break;
            default:
                subfolder = 'misc';
        }

        const uploadPath = path.join(__dirname, '..', 'uploads', 'contracts', contractId, subfolder);

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

const uploadContracts = multer({ storage });

module.exports = { uploadContracts };
