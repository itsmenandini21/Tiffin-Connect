import { createFeedback, getFeedbackTemplates, getActiveFeedBackForUser, deleteTemplates } from "../controllers/feedbackController.js";
import express from "express";
import { requireProviderAuth, requireUserAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", requireProviderAuth, createFeedback);
router.get("/templates", requireProviderAuth, getFeedbackTemplates);
router.delete("/delete/:id", requireProviderAuth, deleteTemplates);
router.get("/active", requireUserAuth, getActiveFeedBackForUser);

export default router;