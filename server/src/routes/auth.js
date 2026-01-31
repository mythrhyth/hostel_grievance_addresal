import express from "express";
import { register, login, me, updateProfile } from "../controllers/auth.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.patch("/profile", requireAuth, updateProfile);

export default router;
