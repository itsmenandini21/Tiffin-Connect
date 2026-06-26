import User from "../models/user.js";
import ProviderProfile from "../models/ProviderProfile.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    if (!email || !password) {
        console.log("Login failed: Missing email or password in request body");
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        console.log(`Attempting login for email: ${email}`);
        const user = await User.findOne({ email: email });
        if (!user) {
            console.log(`Login failed: User with email ${email} is not registered`);
            return res.status(400).json({ message: "User not registered" });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: "Your account has been suspended by the administrator" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );

        let isVerified = true;
        if (user.role === "provider") {
            const profile = await ProviderProfile.findOne({ userId: user._id });
            if (profile) {
                isVerified = profile.isVerified;
            } else {
                isVerified = false;
            }
        }

        return res.status(200).json({ 
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified
            }
        });
    } catch (err) {
        console.error("!!! LOGIN CONTROLLER EXCEPTION !!!");
        console.error(err.stack || err);
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

const userSignUp = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) return res.status(400).json({ message: "User is already registered" });
        
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            role: req.body.role,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber
        });

        if (req.body.role === "provider") {
            await ProviderProfile.create({
                userId: newUser._id,
                businessName: req.body.businessName,
                fssaiCertificate: req.body.fssaiCertificate,
                kitchenPhotos: req.body.kitchenPhotos,
                bankDetails: {
                    accountNumber: req.body.bankAccount,
                    ifscCode: req.body.ifscCode
                }
            });
        }

        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );

        return res.status(201).json({ 
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isVerified: newUser.role === "provider" ? false : true
            }
        });
    } catch (err) {
        console.error(err.stack || err);
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

const getProfile = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            const token = req.headers.authorization.split(" ")[1];
            const decoded_token = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
            const user = await User.findById(decoded_token.id).select("-password");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            
            let profile = null;
            if (user.role === "provider") {
                profile = await ProviderProfile.findOne({ userId: user._id });
            }
            
            return res.status(200).json({ user, profile });
        } else {
            return res.status(401).json({ message: "Token not provided" });
        }
    } catch (err) {
        console.error("Get profile error:", err);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

const updatePassword = async (req, res) => {
    try {
        if (!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token not provided" });
        }
        const token = req.headers.authorization.split(" ")[1];
        const decoded_token = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old and new passwords are required" });
        }

        const user = await User.findById(decoded_token.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old password" });
        }

        user.password = newPassword; // Will be hashed by pre-save hook in User model
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Update password error:", err.stack || err);
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
};

const updateProfile = async (req, res) => {
    try {
        if (!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token not provided" });
        }
        const token = req.headers.authorization.split(" ")[1];
        const decoded_token = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        
        const { name, phoneNumber, businessName, fssaiCertificate, bankAccount, ifscCode } = req.body;

        const user = await User.findById(decoded_token.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        await user.save();

        if (user.role === "provider") {
            const profile = await ProviderProfile.findOne({ userId: user._id });
            if (profile) {
                if (businessName) profile.businessName = businessName;
                if (fssaiCertificate) profile.fssaiCertificate = fssaiCertificate;
                
                if (!profile.bankDetails) profile.bankDetails = {};
                if (bankAccount) profile.bankDetails.accountNumber = bankAccount;
                if (ifscCode) profile.bankDetails.ifscCode = ifscCode;
                
                await profile.save();
            }
        }

        return res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("Update profile error:", err.stack || err);
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
};

export { userLogin, userSignUp, getProfile, updatePassword, updateProfile };