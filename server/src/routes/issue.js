import express from "express";
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  escalateIssue,
  getIssueStats,
  assignUnassignedIssues
} from "../controllers/issue.js";
import {
  getCommentsByIssueId,
  createComment,
  addReaction
} from "../controllers/comment.js";
import { getIssueLogs } from "../controllers/issueLog.js";

import { requireAuth } from "../middlewares/auth.js";
import { loadIssue } from "../middlewares/issue.js";
import { checkVisibility } from "../middlewares/visibility.js";
import { canEscalate } from "../middlewares/escalation.js";

import {validateStatusChange} from "../middlewares/lifecycle.js";
const router = express.Router();

// POST /api/issues
router.post("/", requireAuth, createIssue);

// GET /api/issues
router.get("/", requireAuth, getIssues);

// GET /api/issues/stats
router.get("/stats", requireAuth, getIssueStats);

// POST /api/issues/assign-unassigned (management only)
router.post("/assign-unassigned", requireAuth, assignUnassignedIssues);

// GET /api/issues/:id
router.get("/:id", requireAuth, loadIssue, checkVisibility, getIssueById);

// PATCH /api/issues/:id/status
router.patch(
  "/:id/status",
  requireAuth,
  loadIssue,
  checkVisibility,
  validateStatusChange,
  updateIssueStatus
);

// POST /api/issues/:id/escalate
router.post(
  "/:id/escalate",
  requireAuth,
  loadIssue,
  canEscalate,
  escalateIssue
);

// GET /api/issues/:id/comments
router.get(
  "/:id/comments",
  requireAuth,
  getCommentsByIssueId
);

// POST /api/issues/:id/comments
router.post(
  "/:id/comments",
  requireAuth,
  createComment
);

// POST /api/comments/:commentId/reactions
router.post(
  "/comments/:commentId/reactions",
  requireAuth,
  addReaction
);

// GET /api/issues/:id/logs
router.get(
  "/:id/logs",
  requireAuth,
  loadIssue,
  checkVisibility,
  getIssueLogs
);


export default router;
