import express from "express";
import { 
    getUserNotifications, 
    markAsRead, 
    markAllAsRead 
} from "../controllers/notificationController.js";
import { requireUserAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(requireUserAuth);

router.get("/", getUserNotifications);
router.put("/read-all", markAllAsRead);
router.put("/read/:id", markAsRead);

export default router;
