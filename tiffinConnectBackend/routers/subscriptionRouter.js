import { createSubscription,cancelSubscription,pauseSubscription,getMySubscriptions,toggleSubscripton, updateInstruction} from "../controllers/subscriptionController.js";
import express from "express"
import { requireUserAuth } from "../middlewares/authMiddleware.js";
const router=express.Router();

router.get("/",requireUserAuth,getMySubscriptions);
router.post("/create",requireUserAuth,createSubscription)
router.put("/update/:id",requireUserAuth,pauseSubscription)
router.delete("/delete/:id",requireUserAuth,cancelSubscription);
router.put("/toggle/:id",requireUserAuth,toggleSubscripton);
router.put("/updateInstruction/:id",requireUserAuth,updateInstruction);
export default router;
