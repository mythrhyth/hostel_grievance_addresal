import LostAndFound from "../models/LostAndFound.js";
import { getFileUrl } from "../middlewares/upload.js";

export const getAllItems = async (req, res, next) => {
  try {
    const {
      type,
      category,
      status = "active",
      hostel,
      block,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Build query
    let query = { status: 'active' }; // Only show active items by default

    // Handle status filter (for claimed items)
    if (status === 'claimed') {
      query.status = 'claimed';
    }

    // Handle type filter (for lost/found tabs)
    if (type && type !== "all") {
      query.type = type;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (hostel && hostel !== "all") {
      query.hostel = hostel;
    }

    if (block && block !== "all") {
      query.block = block;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await LostAndFound.find(query)
      .populate('reportedBy', 'name role hostel block room')
      .populate('claimedBy', 'name role hostel block room')
      .populate('resolvedBy', 'name role hostel block room')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LostAndFound.countDocuments(query);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching lost and found items:', err);
    next(err);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await LostAndFound.findById(id)
      .populate('reportedBy', 'name role hostel block room')
      .populate('claimedBy', 'name role hostel block room')
      .populate('resolvedBy', 'name role hostel block room');

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    console.error('Error fetching lost and found item:', err);
    next(err);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      type,
      location,
      dateLostOrFound,
      contactInfo,
      tags = [],
      hostel,
      block,
      isUrgent = false,
      reward
    } = req.body;

    // Handle uploaded files
    const uploadedImages = req.files ? req.files.map(file => getFileUrl(file.filename)) : [];

    // Basic validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    if (!type) {
      return res.status(400).json({ message: "Type (lost/found) is required" });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({ message: "Location is required" });
    }

    if (!dateLostOrFound) {
      return res.status(400).json({ message: "Date lost or found is required" });
    }

    if (!contactInfo || !contactInfo.name || !contactInfo.phone) {
      return res.status(400).json({ message: "Contact name and phone are required" });
    }

    if (!hostel) {
      return res.status(400).json({ message: "Hostel is required" });
    }

    const item = await LostAndFound.create({
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      status: 'active', // Set initial status to active
      location: location.trim(),
      dateLostOrFound: new Date(dateLostOrFound),
      contactInfo: {
        name: contactInfo.name.trim(),
        phone: contactInfo.phone.trim(),
        email: contactInfo.email?.trim(),
        room: contactInfo.room?.trim()
      },
      images: uploadedImages,
      tags: tags.map(tag => tag.trim()).filter(tag => tag),
      reportedBy: req.user._id,
      hostel: hostel.trim(),
      block: block?.trim(),
      isUrgent,
      reward: reward ? parseFloat(reward) : undefined
    });

    // Populate user details for response
    const populatedItem = await LostAndFound.findById(item._id)
      .populate('reportedBy', 'name role hostel block room');

    res.status(201).json(populatedItem);
  } catch (err) {
    console.error('Error creating lost and found item:', err);
    next(err);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      location,
      dateLostOrFound,
      contactInfo,
      tags,
      hostel,
      block,
      isUrgent,
      reward
    } = req.body;

    // Handle uploaded files
    const uploadedImages = req.files ? req.files.map(file => getFileUrl(file.filename)) : [];

    const item = await LostAndFound.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if user can edit this item
    if (
      !item.reportedBy.equals(req.user._id) &&
      req.user.role.toLowerCase() !== 'management' &&
      req.user.role.toLowerCase() !== 'caretaker'
    ) {
      return res.status(403).json({ message: "Not allowed to edit this item" });
    }

    // Update fields
    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category;
    if (location) item.location = location.trim();
    if (dateLostOrFound) item.dateLostOrFound = new Date(dateLostOrFound);
    if (contactInfo) {
      if (contactInfo.name) item.contactInfo.name = contactInfo.name.trim();
      if (contactInfo.phone) item.contactInfo.phone = contactInfo.phone.trim();
      if (contactInfo.email !== undefined) item.contactInfo.email = contactInfo.email?.trim();
      if (contactInfo.room !== undefined) item.contactInfo.room = contactInfo.room?.trim();
    }
    if (uploadedImages.length > 0) item.images = uploadedImages;
    if (tags !== undefined) item.tags = tags.map(tag => tag.trim()).filter(tag => tag);
    if (hostel) item.hostel = hostel.trim();
    if (block !== undefined) item.block = block?.trim();
    if (isUrgent !== undefined) item.isUrgent = isUrgent;
    if (reward !== undefined) item.reward = reward ? parseFloat(reward) : undefined;

    await item.save();

    // Populate user details for response
    const populatedItem = await LostAndFound.findById(item._id)
      .populate('reportedBy', 'name role hostel block room')
      .populate('claimedBy', 'name role hostel block room')
      .populate('resolvedBy', 'name role hostel block room');

    res.json(populatedItem);
  } catch (err) {
    console.error('Error updating lost and found item:', err);
    next(err);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await LostAndFound.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if user can delete this item
    if (
      !item.reportedBy.equals(req.user._id) &&
      req.user.role.toLowerCase() !== 'management'
    ) {
      return res.status(403).json({ message: "Not allowed to delete this item" });
    }

    await LostAndFound.findByIdAndDelete(id);

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error('Error deleting lost and found item:', err);
    next(err);
  }
};

export const claimItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { contactInfo } = req.body;

    const item = await LostAndFound.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.status !== "active") {
      return res.status(400).json({ message: "Item is not available for claiming" });
    }

    if (item.reportedBy.equals(req.user._id)) {
      return res.status(400).json({ message: "You cannot claim your own item" });
    }

    // Update item status
    item.status = "claimed";
    item.claimedBy = req.user._id;
    item.claimedAt = new Date();

    if (contactInfo) {
      item.contactInfo = {
        ...item.contactInfo,
        ...contactInfo
      };
    }

    await item.save();

    // Populate user details for response
    const populatedItem = await LostAndFound.findById(item._id)
      .populate('reportedBy', 'name role hostel block room')
      .populate('claimedBy', 'name role hostel block room')
      .populate('resolvedBy', 'name role hostel block room');

    res.json(populatedItem);
  } catch (err) {
    console.error('Error claiming lost and found item:', err);
    next(err);
  }
};

export const resolveItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    const item = await LostAndFound.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Only management or caretaker can resolve items
    if (
      req.user.role.toLowerCase() !== 'management' &&
      req.user.role.toLowerCase() !== 'caretaker'
    ) {
      return res.status(403).json({ message: "Only management or caretaker can resolve items" });
    }

    if (item.status === "resolved") {
      return res.status(400).json({ message: "Item is already resolved" });
    }

    // Update item status
    item.status = "resolved";
    item.resolvedBy = req.user._id;
    item.resolvedAt = new Date();

    await item.save();

    // Populate user details for response
    const populatedItem = await LostAndFound.findById(item._id)
      .populate('reportedBy', 'name role hostel block room')
      .populate('claimedBy', 'name role hostel block room')
      .populate('resolvedBy', 'name role hostel block room');

    res.json(populatedItem);
  } catch (err) {
    console.error('Error resolving lost and found item:', err);
    next(err);
  }
};

export const getMyItems = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    let query = { reportedBy: req.user._id };

    if (type && type !== "all") {
      query.type = type;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await LostAndFound.find(query)
      .populate('claimedBy', 'name role hostel block room')
      .populate('resolvedBy', 'name role hostel block room')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LostAndFound.countDocuments(query);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching user lost and found items:', err);
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await LostAndFound.aggregate([
      {
        $group: {
          _id: null,
          totalLost: {
            $sum: { $cond: [{ $eq: ["$type", "lost"] }, 1, 0] }
          },
          totalFound: {
            $sum: { $cond: [{ $eq: ["$type", "found"] }, 1, 0] }
          },
          active: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
          },
          claimed: {
            $sum: { $cond: [{ $eq: ["$status", "claimed"] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          },
          urgent: {
            $sum: { $cond: ["$isUrgent", 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await LostAndFound.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: stats[0] || {
        totalLost: 0,
        totalFound: 0,
        active: 0,
        claimed: 0,
        resolved: 0,
        urgent: 0
      },
      byCategory: categoryStats
    });
  } catch (err) {
    console.error('Error fetching lost and found stats:', err);
    next(err);
  }
};
