const fs = require('fs');
const path = require('path');

const createUploadDirectories = () => {
    const baseUploadPath = path.join(__dirname, '..', 'uploads');
    
    // Base directories
    const directories = [
        'spaces',
        'contracts',
        'users'
    ];

    // Create base upload directory if it doesn't exist
    if (!fs.existsSync(baseUploadPath)) {
        fs.mkdirSync(baseUploadPath);
    }

    // Create each base directory if it doesn't exist
    directories.forEach(dir => {
        const dirPath = path.join(baseUploadPath, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
    });

    console.log('Upload directories structure initialized successfully');
};

module.exports = createUploadDirectories; 