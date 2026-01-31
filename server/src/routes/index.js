import express from "express";
import authRoutes from "./auth.js";


const router = express.Router();


router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running "
  });
});
router.use("/auth", authRoutes);
export default router;
