import express from "express";
import { addMenu, getMenu,updateMenu,deleteMenu} from "../controllers/tiffinController.js";
import { requireProviderAuth } from "../middlewares/authMiddleware.js";
const router=express.Router();

router.post("/addMenu",requireProviderAuth,addMenu);
router.get("/getMenu",requireProviderAuth,getMenu);
router.put("/update/:id",requireProviderAuth,updateMenu);
router.delete("/delete/:id",requireProviderAuth,deleteMenu);

export default router;
