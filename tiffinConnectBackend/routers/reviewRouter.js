import { createReview,getAllReviewsOfTS } from "../controllers/reviewController.js";
import express from "express";
import { requireProviderAuth , requireUserAuth} from "../middlewares/authMiddleware.js";

const router = express.Router()
 router.post("/create",requireUserAuth,createReview);
 router.get("/getAll/:id",requireProviderAuth,getAllReviewsOfTS);

 export default router;