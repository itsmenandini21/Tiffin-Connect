import User from "../models/user.js";
import ProviderProfile from "../models/ProviderProfile.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: "User not registered" });
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

        return res.status(200).json({ 
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
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
                kitchenPhotos: req.body.kitchenPhotos
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
                role: newUser.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { userLogin, userSignUp };