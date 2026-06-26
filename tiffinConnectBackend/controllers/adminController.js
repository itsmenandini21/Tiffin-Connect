import User from "../models/user.js";
import ProviderProfile from "../models/ProviderProfile.js";
import TiffinService from "../models/TiffinService.js";
import Subscription from "../models/Subscription.js";
import Review from "../models/Review.js";

// 1. Get Platform Stats
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" });
        const totalProviders = await User.countDocuments({ role: "provider" });
        const totalKitchens = await TiffinService.countDocuments();
        const activeSubscriptionsCount = await Subscription.countDocuments({ status: "active" });
        const pendingVerificationsCount = await ProviderProfile.countDocuments({ isVerified: false });

        // Calculate estimated revenue from active subscriptions
        const activeSubs = await Subscription.find({ status: "active" }).populate("tiffinServiceId");
        let totalRevenue = 0;
        const planDistribution = { weekly: 0, monthly: 0, yearly: 0 };
        
        activeSubs.forEach(sub => {
            if (sub.tiffinServiceId) {
                let mealsMultiplier = 1;
                if (sub.planType === "weekly") mealsMultiplier = 7;
                else if (sub.planType === "monthly") mealsMultiplier = 30;
                else if (sub.planType === "yearly") mealsMultiplier = 365;
                totalRevenue += sub.tiffinServiceId.pricePerMeal * mealsMultiplier;
            }
            if (planDistribution[sub.planType] !== undefined) {
                planDistribution[sub.planType]++;
            }
        });

        // Activity Feed (Merge latest registrations, subscriptions, and reviews)
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
        const recentSubscriptions = await Subscription.find()
            .populate("userId", "name")
            .populate("tiffinServiceId", "title")
            .sort({ createdAt: -1 })
            .limit(5);
        const recentReviews = await Review.find()
            .populate("userId", "name")
            .populate("tiffinServiceId", "title")
            .sort({ createdAt: -1 })
            .limit(5);

        const activities = [];
        
        recentUsers.forEach(u => {
            activities.push({
                type: "registration",
                message: `${u.name} registered as a ${u.role === 'provider' ? 'Chef/Provider' : 'Customer'}.`,
                date: u.createdAt
            });
        });

        recentSubscriptions.forEach(s => {
            if (s.userId && s.tiffinServiceId) {
                activities.push({
                    type: "subscription",
                    message: `${s.userId.name} subscribed to "${s.tiffinServiceId.title}" (${s.planType} plan).`,
                    date: s.createdAt
                });
            }
        });

        recentReviews.forEach(r => {
            if (r.userId && r.tiffinServiceId) {
                activities.push({
                    type: "review",
                    message: `${r.userId.name} left a ${r.rating}★ rating on "${r.tiffinServiceId.title}".`,
                    date: r.createdAt
                });
            }
        });

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        const activityFeed = activities.slice(0, 8);

        // Fetch top 3 pending verifications to show on overview
        const quickPending = await ProviderProfile.find({ isVerified: false })
            .populate("userId", "name email")
            .limit(3);

        res.status(200).json({
            totalUsers,
            totalProviders,
            totalKitchens,
            activeSubscriptionsCount,
            pendingVerificationsCount,
            totalRevenue,
            planDistribution,
            activityFeed,
            quickPending
        });
    } catch (err) {
        console.error("Error fetching admin stats:", err);
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
};

// 2. Get Pending Providers for Verification
const getPendingProviders = async (req, res) => {
    try {
        const pending = await ProviderProfile.find({ isVerified: false })
            .populate("userId", "name email phoneNumber address");
        res.status(200).json(pending);
    } catch (err) {
        console.error("Error fetching pending providers:", err);
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
};

// 3. Verify/Approve a Provider Profile
const verifyProvider = async (req, res) => {
    try {
        const { id } = req.params; // profile id
        const profile = await ProviderProfile.findByIdAndUpdate(
            id,
            { isVerified: true },
            { new: true }
        ).populate("userId", "name email");

        if (!profile) {
            return res.status(404).json({ message: "Provider Profile not found" });
        }

        res.status(200).json({ message: "Provider verified successfully", profile });
    } catch (err) {
        console.error("Error verifying provider:", err);
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
};

// 4. Get All Users (with filter options)
const getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};
        
        if (role) {
            query.role = role;
        }
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const users = await User.find(query).select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
};

// 5. Toggle User Block/Suspension Status
const toggleUserBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === "admin") {
            return res.status(400).json({ message: "Cannot block an administrator" });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({
            message: `User account has been ${user.isBlocked ? 'suspended' : 'reactivated'}`,
            user: { id: user._id, name: user.name, isBlocked: user.isBlocked }
        });
    } catch (err) {
        console.error("Error toggling block status:", err);
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
};

// 6. Get All Tiffin Services
const getAllTiffinServices = async (req, res) => {
    try {
        const services = await TiffinService.find()
            .populate("providerId", "name email phoneNumber");
        res.status(200).json(services);
    } catch (err) {
        console.error("Error fetching all services:", err);
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
};

// 7. Toggle Tiffin Service Active Status
const toggleServiceActive = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await TiffinService.findById(id);

        if (!service) {
            return res.status(404).json({ message: "Tiffin Service not found" });
        }

        service.isActive = !service.isActive;
        await service.save();

        res.status(200).json({
            message: `Tiffin service has been ${service.isActive ? 'activated' : 'deactivated'}`,
            service
        });
    } catch (err) {
        console.error("Error toggling service status:", err);
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
};

// 8. Get Sorted Reviews (Good Reviews vs. Bad Reviews Feed)
const getReviewsForAdmin = async (req, res) => {
    try {
        const allReviews = await Review.find()
            .populate("userId", "name email")
            .populate("tiffinServiceId", "title providerId")
            .sort({ createdAt: -1 });

        // Separate reviews into good (4 & 5 stars) and bad (1 & 2 stars)
        const goodReviews = allReviews.filter(r => r.rating >= 4);
        const badReviews = allReviews.filter(r => r.rating <= 2);

        res.status(200).json({
            goodReviews,
            badReviews,
            totalCount: allReviews.length
        });
    } catch (err) {
        console.error("Error fetching reviews for admin:", err);
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
};

// 9. Get All Subscriptions
const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
            .populate("userId", "name email phoneNumber")
            .populate({
                path: "tiffinServiceId",
                select: "title pricePerMeal",
                populate: {
                    path: "providerId",
                    select: "name"
                }
            })
            .sort({ createdAt: -1 });
            
        res.status(200).json(subscriptions);
    } catch (err) {
        console.error("Error fetching all subscriptions:", err);
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
};

export {
    getStats,
    getPendingProviders,
    verifyProvider,
    getAllUsers,
    toggleUserBlock,
    getAllTiffinServices,
    toggleServiceActive,
    getReviewsForAdmin,
    getAllSubscriptions
};
