import jwt from "jsonwebtoken";
import User from "../models/user.js";

const requireProviderAuth = async (req, res, next) => {
    // 1. Check if the authorization header exists and starts with "Bearer"
    if (req.headers && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        try {
            // 2. Extract the token
            const token = req.headers.authorization.split(" ")[1];
            
            // 3. Verify and decode the token
            const decoded_token = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
            
            // 4. Find the user in the database using the ID from the token
            const provider = await User.findById(decoded_token.id);
            
            // 5. Check if the user exists and has the "provider" role
            if (!provider || provider.role !== "provider") {
                return res.status(403).json({ message: "You are not authorized to perform this action" });
            }
            if (provider.isBlocked) {
                return res.status(403).json({ message: "Your account has been suspended" });
            }
            
            // 6. Attach the provider to the request object
            req.provider = provider;
            next();
        } catch (err) {
            console.error("JWT Error:", err);
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    } else {
        return res.status(401).json({ message: "Token not provided" });
    }
}

const requireUserAuth = async (req, res, next) => {
    if (req.headers && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded_token = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
            const user = await User.findById(decoded_token.id);
            if (!user || user.role !== "user") {
                return res.status(403).json({ message: "You are not authorized to perform this action" });
            }
            if (user.isBlocked) {
                return res.status(403).json({ message: "Your account has been suspended" });
            }
            req.user = user;
            next();
        } catch (err) {
            console.error("JWT Error:", err);
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    } else {
        return res.status(401).json({ message: "Token not provided" });
    }
}

const requireAdminAuth = async (req, res, next) => {
    if (req.headers && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded_token = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
            const admin = await User.findById(decoded_token.id);
            if (!admin || admin.role !== "admin") {
                return res.status(403).json({ message: "You are not authorized to perform this action" });
            }
            req.admin = admin;
            next();
        } catch (err) {
            console.error("JWT Error:", err);
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    } else {
        return res.status(401).json({ message: "Token not provided" });
    }
}

export { requireProviderAuth, requireUserAuth, requireAdminAuth };