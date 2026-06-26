import express from "express";
import { userLogin, userSignUp, getProfile, updatePassword, updateProfile } from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";
const router = express.Router();

router.post("/signUp", userSignUp);
router.post("/login", userLogin);
router.post("/google-login", googleLogin);
router.get("/profile", getProfile);
router.put("/update-password", updatePassword);
router.put("/update-profile", updateProfile);

export default router;
