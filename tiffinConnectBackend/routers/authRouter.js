import express from "express";
import { userLogin, userSignUp } from "../controllers/authController.js";
const router = express.Router();

router.post("/signUp", userSignUp);
router.post("/login", userLogin);

export default router;
