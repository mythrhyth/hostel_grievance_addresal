import express from "express";
import {
  sendWelcomeNotification,
  sendIssueStatusNotification,
  sendAnnouncementNotification,
  sendLostAndFoundNotification,
  sendPollNotification,
  testEmailNotification
} from "../controllers/notification.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/notifications/welcome - Send welcome email
router.post("/welcome", requireAuth, sendWelcomeNotification);

// POST /api/notifications/issue-status - Send issue status update
router.post("/issue-status", requireAuth, sendIssueStatusNotification);

// POST /api/notifications/announcement - Send announcement notification
router.post("/announcement", requireAuth, sendAnnouncementNotification);

// POST /api/notifications/lost-found - Send lost and found notification
router.post("/lost-found", requireAuth, sendLostAndFoundNotification);

// POST /api/notifications/poll - Send poll notification
router.post("/poll", requireAuth, sendPollNotification);

// POST /api/notifications/test - Test email notification (development only)
router.post("/test", requireAuth, testEmailNotification);

export default router;
