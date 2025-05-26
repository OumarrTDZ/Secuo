const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { reportId } = req.params;
        const spaceId = req.body.spaceId || req.query.spaceId || req.headers['x-space-id'];

        if (!spaceId || !reportId) return cb(new Error('Missing spaceId or reportId'));

        const uploadPath = path.join(__dirname, '..', 'uploads', spaceId, 'reports', reportId);
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${timestamp}-${file.fieldname}${ext}`);
    }
});

const uploadReportImages = multer({ storage });
module.exports = { uploadReportImages };
