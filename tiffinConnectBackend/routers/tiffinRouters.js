import express from "express";
import { addMenu, getProviderServices, updateMenu, deleteMenu, getAllServices } from "../controllers/tiffinController.js";
import { requireProviderAuth, requireUserAuth } from "../middlewares/authMiddleware.js";
const router=express.Router();

router.post("/addMenu",requireProviderAuth,addMenu);
router.get("/getMenu",requireProviderAuth,getProviderServices);
router.put("/update/:id",requireProviderAuth,updateMenu);
router.delete("/delete/:id",requireProviderAuth,deleteMenu);
router.get("/allServices", requireUserAuth, getAllServices);

export default router;
