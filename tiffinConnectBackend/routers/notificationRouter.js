import express from "express";
import { 
    getUserNotifications, 
    markAsRead, 
    markAllAsRead,
    createNotification
} from "../controllers/notificationController.js";
import { requireUserAuth, requireProviderAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireUserAuth, getUserNotifications);
router.put("/read-all", requireUserAuth, markAllAsRead);
router.put("/read/:id", requireUserAuth, markAsRead);
router.post("/create", requireProviderAuth, createNotification);

export default router;
