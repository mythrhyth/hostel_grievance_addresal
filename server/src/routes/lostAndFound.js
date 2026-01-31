import express from "express";
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  claimItem,
  resolveItem,
  getMyItems,
  getStats
} from "../controllers/lostAndFound.js";
import { uploadMultiple } from "../middlewares/upload.js";

import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

// GET /api/lost-and-found - Get all lost and found items with filtering
router.get("/", requireAuth, getAllItems);

// GET /api/lost-and-found/stats - Get lost and found statistics
router.get("/stats", requireAuth, getStats);

// GET /api/lost-and-found/my-items - Get current user's items
router.get("/my-items", requireAuth, getMyItems);

// GET /api/lost-and-found/:id - Get specific item by ID
router.get("/:id", requireAuth, getItemById);

// POST /api/lost-and-found - Create new lost and found item
router.post("/", requireAuth, uploadMultiple, createItem);

// PATCH /api/lost-and-found/:id - Update existing item
router.patch("/:id", requireAuth, uploadMultiple, updateItem);

// DELETE /api/lost-and-found/:id - Delete item
router.delete("/:id", requireAuth, deleteItem);

// POST /api/lost-and-found/:id/claim - Claim an item
router.post("/:id/claim", requireAuth, claimItem);

// POST /api/lost-and-found/:id/resolve - Resolve an item (management/caretaker only)
router.post("/:id/resolve", requireAuth, resolveItem);

export default router;
