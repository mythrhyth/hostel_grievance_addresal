import express from "express";
import {
  createPoll,
  voteOnPoll,
  getPolls,
  getPollById
} from "../controllers/poll.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/polls
router.post("/", requireAuth, createPoll);

// GET /api/polls
router.get("/", requireAuth, getPolls);

// GET /api/polls/:id
router.get("/:id", requireAuth, getPollById);

// POST /api/polls/:id/vote
router.post("/:id/vote", requireAuth, voteOnPoll);

export default router;
