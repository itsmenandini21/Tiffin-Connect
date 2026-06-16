
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routers/authRouter.js";
import tiffinRouter from "./routers/tiffinRouters.js"
import subscriptionRouter from "./routers/subscriptionRouter.js"
import reviewRouter from "./routers/reviewRouter.js"
import feedbackRouter from "./routers/feedbackRouter.js"
dotenv.config();
import connectDB from "./config/db.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRouter);
app.use("/api/tiffin",tiffinRouter);
app.use("/api/subscription",subscriptionRouter);
app.use("/api/review",reviewRouter);
app.use("/api/feedback",feedbackRouter);
connectDB();
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server is running at ${port}`)
});