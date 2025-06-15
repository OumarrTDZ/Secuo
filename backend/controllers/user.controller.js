const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Contract = require('../models/Contract.model');
const Space = require('../models/Space.model');
const { isValidObjectId } = require('mongoose');
const fs = require('fs');
const path = require('path');

// Get relative paths for uploaded files
const getRelativePath = (fieldname, req) => {
    if (!req.files || !req.files[fieldname] || !req.files[fieldname][0]) return null;

    const file = req.files[fieldname][0];
    const subfolder = fieldname === 'idFrontPhoto' ? 'idfront' :
                     fieldname === 'idBackPhoto' ? 'idback' :
                     fieldname === 'profilePhoto' ? 'profilephoto' : 'misc';

    // Construct and return a relative path
    return `/uploads/users/${req.body.dni}/${subfolder}/${file.filename}`;
};

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { dni, firstName, lastName, email, phoneNumber, preference, password } = req.body;

        // Get relative paths for uploaded files
        const idFrontPhoto = getRelativePath('idFrontPhoto', req);
        const idBackPhoto = getRelativePath('idBackPhoto', req);
        const profilePhoto = getRelativePath('profilePhoto', req);

        // Validate required files
        if (!idFrontPhoto || !idBackPhoto) {
            return res.status(400).json({ error: 'Both front and back DNI photos are required' });
        }

        // Check if user with email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already in use" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user document
        const user = new User({
            dni,
            firstName,
            lastName,
            email,
            phoneNumber,
            preference,
            idFrontPhoto,
            idBackPhoto,
            profilePhoto,
            password: hashedPassword,
            validationStatus: 'PENDING'
        });

        await user.save();

        // Generate JWT token (optional)
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });

        res.status(201).json({
            message: "User successfully registered",
            token,
            user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// User login
const loginUser = async (req, res) => {
    try {
        const { dni, password } = req.body;

        const user = await User.findOne({ dni });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect password" });
        }

        const token = jwt.sign(
            { id: user._id, dni: user.dni, preference: user.preference },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        // Crear un objeto de usuario con solo los campos necesarios
        const userResponse = {
            _id: user._id,
            dni: user.dni,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            preference: user.preference,
            validationStatus: user.validationStatus
        };

        res.json({
            message: "Login successful",
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update user profile (only user themselves)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        if (req.user._id.toString() !== id) {
            return res.status(403).json({ error: "Unauthorized: You can only edit your own profile" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const {
            firstName,
            lastName,
            phoneNumber,
            preference,
            currentPassword,
            newPassword,
            confirmPassword,
        } = req.body;

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (preference) user.preference = preference;

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required to change your password' });
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ error: 'Passwords do not match' });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid current password' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }


        const getRelativePath = (fieldname) => {
            if (!req.files || !req.files[fieldname]) return null;
            const file = req.files[fieldname][0];
            const subfolder = fieldname === 'idFrontPhoto' ? 'idfront'
                : fieldname === 'idBackPhoto' ? 'idback'
                    : fieldname === 'profilePhoto' ? 'profilephoto'
                        : 'misc';
            return `/uploads/users/${user.dni}/${subfolder}/${file.filename}`;
        };

        ['profilePhoto', 'idFrontPhoto', 'idBackPhoto'].forEach((field) => {
            const newPath = getRelativePath(field);
            if (newPath) user[field] = newPath;
        });

        await user.save();
        res.json({ message: "User updated successfully", user });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Delete user profile (only user themselves)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user || req.user._id.toString() !== id) {
            return res.status(403).json({ error: "Unauthorized: You can only delete your own account" });
        }

        await User.findByIdAndDelete(id);
        res.json({ message: "User account deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get user profile (from token)
const getUserProfile = async (req, res) => {
    res.json({ message: "User profile", user: req.user });
};

// Approve or reject user (admin action)
const validateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { validationStatus } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.validationStatus = validationStatus;
        await user.save();

        // Send notification to the user
        const io = req.app.get('io');
        if (io) {
            const title = validationStatus === 'APPROVED' ? 'Account Approved!' : 'Account Rejected';
            const message = validationStatus === 'APPROVED'
                ? 'Your account has been approved. You can now use all features of the platform.'
                : 'Your account has been rejected. Please review your documents and try again.';

            await io.notifyUser(
                user.dni,
                validationStatus === 'APPROVED' ? 'USER_APPROVED' : 'USER_REJECTED',
                title,
                message,
                user._id
            );
        }

        res.json({ message: 'User validation status updated successfully', user });
    } catch (error) {
        console.error('Error validating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get dashboard for tenant (rented spaces and contracts)
const getTenantDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const rentedContracts = await Contract.find({ tenantDni: user.dni }).populate({
            path: "spaceId",
            model: "Space",
            select: "spaceType monthlyPrice description _id gallery rooms city marking address"
        });

        const rentedSpaces = rentedContracts.map(contract => contract.spaceId);

        res.json({ message: "User profile", user, rentedSpaces });
    } catch (error) {
        console.error("Error in getTenantDashboard:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Get dashboard for owner (owned spaces)
const getOwnerDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Get owned spaces with all necessary fields
        const ownedSpaces = await Space.find({ ownerDni: user.dni }).select(
            "spaceType monthlyEarnings description _id gallery rooms validationStatus status marking squareMeters municipality city address postalCode floor door"
        );

        // Get contracts and earnings for each space
        const spacesWithData = await Promise.all(ownedSpaces.map(async (space) => {
            // Get all active contracts for this space
            const activeContracts = await Contract.find({
                spaceId: space._id,
                contractStatus: 'ACTIVE'
            });

            // Calculate total monthly earnings from active contracts
            const monthlyEarnings = activeContracts.reduce((total, contract) => {
                return total + (contract.monthlyPayment || 0);
            }, 0);

            // Get total contracts count
            const contractsCount = await Contract.countDocuments({ spaceId: space._id });

            // Convert to plain object and add the data
            const spaceObj = space.toObject();
            spaceObj.contracts = contractsCount;
            spaceObj.monthlyEarnings = monthlyEarnings;

            return spaceObj;
        }));

        res.json({ user, ownedSpaces: spacesWithData });
    } catch (error) {
        console.error("Error in getOwnerDashboard:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Delete profile photo file and remove path in user document
const deleteProfilePhoto = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found." });

        if (user.profilePhoto) {
            const filePath = path.isAbsolute(user.profilePhoto)
                ? user.profilePhoto
                : path.join(__dirname, "..", user.profilePhoto);

            fs.unlink(filePath, (err) => {
                if (err) console.warn("Could not delete old profile photo", err);
            });
        }

        user.profilePhoto = null;
        await user.save();

        res.json({ message: "Profile photo deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update profile photo file and path in user document
const updateProfilePhoto = async (req, res) => {
    try {
        const user = await User.findOne({ dni: req.params.dni });
        if (!user) return res.status(404).json({ error: "User not found." });

        // Delete old profile photo if exists
        if (user.profilePhoto) {
            const filePath = path.isAbsolute(user.profilePhoto)
                ? user.profilePhoto
                : path.join(__dirname, "..", user.profilePhoto);

            fs.unlink(filePath, (err) => {
                if (err) console.warn("Could not delete old profile photo", err);
            });
        }

        // Save new relative path of uploaded file
        const relativePath = req.file.path.replace(path.join(__dirname, ".."), "").replace(/\\/g, "/");
        user.profilePhoto = relativePath;
        await user.save();

        res.json({ message: "Profile photo updated", photo: user.profilePhoto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUserPreference  = async (req, res) => {
    const { preference } = req.body;
    if (!['OWNER', 'TENANT'].includes(preference)) {
        return res.status(400).json({ error: 'Invalid preference' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { preference },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}



module.exports = {
    getOwnerDashboard,
    getTenantDashboard,
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getUserProfile,
    validateUser,
    deleteProfilePhoto,
    updateProfilePhoto,
    updateUserPreference
};
