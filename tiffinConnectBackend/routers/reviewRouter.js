import { createReview, getAllReviewsOfTS, getPublicReviewsOfTS, deleteReview } from "../controllers/reviewController.js";
import express from "express";
import { requireProviderAuth , requireUserAuth} from "../middlewares/authMiddleware.js";

const router = express.Router()
 router.post("/create",requireUserAuth,createReview);
 router.get("/getAll/:id",requireProviderAuth,getAllReviewsOfTS);
 router.get("/public/:id",requireUserAuth,getPublicReviewsOfTS);
 router.delete("/delete/:id",requireProviderAuth,deleteReview);

 export default router;