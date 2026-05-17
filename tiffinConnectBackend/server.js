
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routers/authRouter.js";
import tiffinRouter from "./routers/tiffinRouters.js"
dotenv.config();
import connectDB from "./config/db.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRouter);
app.use("/api/tiffin",tiffinRouter);
connectDB();
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server is running at ${port}`)
});