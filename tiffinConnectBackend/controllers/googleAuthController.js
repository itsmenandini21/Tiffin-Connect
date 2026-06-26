import User from "../models/user.js";
import ProviderProfile from "../models/ProviderProfile.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        return res.status(400).json({ message: "Credential token is required" });
    }

    try {
        // Verify Google ID Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ message: "Invalid token payload" });
        }

        const { email, name } = payload;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create user with placeholders for required fields
            const randomPassword = Math.random().toString(36).slice(-16);
            user = await User.create({
                name,
                email,
                password: randomPassword,
                address: {
                    street: "Complete Profile Address",
                    city: "City",
                    state: "State",
                    pincode: "000000"
                },
                phoneNumber: "0000000000",
                role: "user" // Default to consumer
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: "Your account has been suspended by the administrator" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );

        // Fetch isVerified if user is a provider
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
            message: "Logged in successfully via Google",
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
        console.error("Google Auth Error:", err);
        return res.status(400).json({ message: "Google authentication failed" });
    }
};
