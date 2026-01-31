import express from "express";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  requireAnnouncementAccess
} from "../controllers/announcement.js";

import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

// GET /api/announcements - Get announcements for current user
router.get("/", requireAuth, getAnnouncements);

// POST /api/announcements - Create new announcement (caretaker/management only)
router.post("/", requireAuth, requireAnnouncementAccess, createAnnouncement);

// PATCH /api/announcements/:id - Update announcement (creator or management only)
router.patch("/:id", requireAuth, updateAnnouncement);

// DELETE /api/announcements/:id - Delete announcement (creator or management only)
router.delete("/:id", requireAuth, deleteAnnouncement);

export default router;
