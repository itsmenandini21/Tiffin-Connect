import express from "express";
import { requireAdminAuth } from "../middlewares/authMiddleware.js";
import {
    getStats,
    getPendingProviders,
    verifyProvider,
    getAllUsers,
    toggleUserBlock,
    getAllTiffinServices,
    toggleServiceActive,
    getReviewsForAdmin,
    getAllSubscriptions
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", requireAdminAuth, getStats);
router.get("/providers/pending", requireAdminAuth, getPendingProviders);
router.put("/providers/verify/:id", requireAdminAuth, verifyProvider);
router.get("/users", requireAdminAuth, getAllUsers);
router.put("/users/block/:id", requireAdminAuth, toggleUserBlock);
router.get("/services", requireAdminAuth, getAllTiffinServices);
router.put("/services/active/:id", requireAdminAuth, toggleServiceActive);
router.get("/reviews", requireAdminAuth, getReviewsForAdmin);
router.get("/subscriptions", requireAdminAuth, getAllSubscriptions);

export default router;
