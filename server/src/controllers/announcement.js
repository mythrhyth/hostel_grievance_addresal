import Announcement from "../models/Announcement.js";
import Poll from "../models/Poll.js";
import { sendAnnouncementEmail } from "../services/notificationService.js";
import User from "../models/User.js";

export const getAnnouncements = async (req, res, next) => {
  try {
    const { hostel, role } = req.user;
    const userRole = role.toLowerCase();
    
    // Build query based on user's role and hostel
    let query = {
      // Don't include expired announcements
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    // Special handling for caretakers - they can see all announcements they created
    if (role === 'CARETAKER') {
      query.$and = [
        {
          $or: [
            // Announcements they created (regardless of target roles/hostels)
            { createdBy: req.user._id },
            // OR announcements targeting their hostels and roles
            {
              $and: [
                {
                  $or: [
                    { targetHostels: { $size: 0 } },
                    { targetHostels: { $in: req.user.hostels || [] } }
                  ]
                },
                {
                  $or: [
                    { targetRoles: { $size: 0 } },
                    { targetRoles: userRole }
                  ]
                }
              ]
            }
          ]
        }
      ];
    } else {
      // Original logic for other roles (students, management)
      query.$and = [
        {
          $or: [
            // Announcements targeting all hostels
            { targetHostels: { $size: 0 } },
            // Announcements targeting user's hostel
            { targetHostels: hostel }
          ]
        },
        {
          $or: [
            // Announcements targeting all roles
            { targetRoles: { $size: 0 } },
            // Announcements targeting user's role (announcement stores lowercase, user stores uppercase)
            { targetRoles: userRole }
          ]
        }
      ];
    }

    // Handle pagination and sorting
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name role')
      .populate({
        path: 'poll',
        populate: [
          {
            path: 'createdBy',
            select: 'name role'
          },
          {
            path: 'options.voters',
            select: 'name'
          },
          {
            path: 'voters',
            select: 'name'
          }
        ]
      })
      .sort(sort)
      .limit(limit);

    // Add user-specific poll data
    const announcementsWithPollData = announcements.map(announcement => {
      if (announcement.poll) {
        const poll = announcement.poll;
        const userVoted = poll.voters.some(voter => voter._id.toString() === req.user._id.toString());
        
        return {
          ...announcement.toObject(),
          poll: {
            ...poll.toObject(),
            totalVotes: poll.totalVotes,
            userVoted: userVoted,
            isExpired: poll.isExpired
          },
          hasPoll: true
        };
      }
      return {
        ...announcement.toObject(),
        hasPoll: false
      };
    });

    res.json(announcementsWithPollData);
  } catch (err) {
    next(err);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, type, targetHostels, targetBlocks, targetRoles, isPinned, expiresAt, pollData } = req.body;

    // Basic validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Role-based validation
    let createdPoll = null;
    
    // Create poll if pollData is provided
    if (pollData) {
      const { question, options, pollExpiresAt } = pollData;
      
      if (!question || !question.trim()) {
        return res.status(400).json({ message: "Poll question is required" });
      }

      if (!options || options.length < 2) {
        return res.status(400).json({ message: "At least 2 poll options are required" });
      }

      const validOptions = options.filter(opt => opt && opt.text && opt.text.trim());
      if (validOptions.length < 2) {
        return res.status(400).json({ message: "At least 2 valid poll options are required" });
      }

      // Use same targetHostels and targetRoles as the announcement
      const pollTargetHostels = targetHostels || [];
      const pollTargetRoles = targetRoles || [];

      // Create poll with same restrictions as announcement
      if (req.user.role === "CARETAKER") {
        const caretakerHostels = req.user.hostels || [];
        
        const invalidHostels = pollTargetHostels.filter(hostel => !caretakerHostels.includes(hostel));
        if (invalidHostels.length > 0) {
          return res.status(403).json({ 
            message: `Caretakers can only create polls for their assigned hostels. Invalid hostels: ${invalidHostels.join(', ')}` 
          });
        }

        const finalTargetRoles = pollTargetRoles.length > 0 ? pollTargetRoles : ['student'];
        
        createdPoll = await Poll.create({
          question: question.trim(),
          options: validOptions.map(opt => ({ text: opt.text.trim(), votes: 0, voters: [] })),
          targetHostels: pollTargetHostels,
          targetRoles: finalTargetRoles,
          expiresAt: pollExpiresAt ? new Date(pollExpiresAt) : undefined,
          createdBy: req.user._id,
          voters: []
        });
      } else if (req.user.role === "MANAGEMENT") {
        createdPoll = await Poll.create({
          question: question.trim(),
          options: validOptions.map(opt => ({ text: opt.text.trim(), votes: 0, voters: [] })),
          targetHostels: pollTargetHostels,
          targetRoles: pollTargetRoles,
          expiresAt: pollExpiresAt ? new Date(pollExpiresAt) : undefined,
          createdBy: req.user._id,
          voters: []
        });
      }
    }

    // Create announcement
    if (req.user.role === "CARETAKER") {
      // Caretakers can only create announcements for their assigned hostels
      const caretakerHostels = req.user.hostels || [];
      
      if (!targetHostels || targetHostels.length === 0) {
        return res.status(400).json({ message: "At least one target hostel is required" });
      }

      // Validate that caretaker is assigned to all requested hostels
      const invalidHostels = targetHostels.filter(hostel => !caretakerHostels.includes(hostel));
      if (invalidHostels.length > 0) {
        return res.status(403).json({ 
          message: `Caretakers can only create announcements for their assigned hostels. Invalid hostels: ${invalidHostels.join(', ')}` 
        });
      }

      // Caretakers can only target students (not other caretakers or management)
      if (targetRoles && targetRoles.length > 0) {
        const invalidRoles = targetRoles.filter(role => !['student'].includes(role.toLowerCase()));
        if (invalidRoles.length > 0) {
          return res.status(403).json({ 
            message: "Caretakers can only create announcements for students" 
          });
        }
      }

      // Auto-set targetRoles to ['student'] for caretakers if not specified
      const finalTargetRoles = targetRoles && targetRoles.length > 0 ? targetRoles : ['student'];

      const announcement = await Announcement.create({
        title: title.trim(),
        content: content.trim(),
        type: type || 'info',
        targetHostels,
        targetBlocks: targetBlocks || [],
        targetRoles: finalTargetRoles,
        isPinned: isPinned || false,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        createdBy: req.user._id,
        poll: createdPoll?._id,
        hasPoll: !!createdPoll
      });

      // Populate author details and poll for response
      const populatedAnnouncement = await Announcement.findById(announcement._id)
        .populate('createdBy', 'name role')
        .populate('poll');

      // Send email notifications to targeted users (async, don't wait)
      sendAnnouncementEmail(populatedAnnouncement, targetHostels, targetRoles).catch(error => {
        console.error('Failed to send announcement notifications:', error);
      });

      res.status(201).json(populatedAnnouncement);

    } else if (req.user.role === "MANAGEMENT") {
      // Management can create announcements for any hostels and roles (existing logic)
      if (!targetHostels || targetHostels.length === 0) {
        return res.status(400).json({ message: "At least one target hostel is required" });
      }

      // Validate expiration date
      if (expiresAt && new Date(expiresAt) <= new Date()) {
        return res.status(400).json({ message: "Expiration date must be in the future" });
      }

      const announcement = await Announcement.create({
        title: title.trim(),
        content: content.trim(),
        type: type || 'info',
        targetHostels,
        targetBlocks: targetBlocks || [],
        targetRoles: targetRoles || [],
        isPinned: isPinned || false,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        createdBy: req.user._id,
        poll: createdPoll?._id,
        hasPoll: !!createdPoll
      });

      // Populate author details and poll for response
      const populatedAnnouncement = await Announcement.findById(announcement._id)
        .populate('createdBy', 'name role')
        .populate('poll');

      // Send email notifications to targeted users (async, don't wait)
      sendAnnouncementEmail(populatedAnnouncement, targetHostels, targetRoles).catch(error => {
        console.error('Failed to send announcement notifications:', error);
      });

      res.status(201).json(populatedAnnouncement);

    } else {
      return res.status(403).json({ message: "Only caretakers and management can create announcements" });
    }

  } catch (err) {
    console.error('Error creating announcement:', err);
    console.error('Request body:', req.body);
    console.error('User:', req.user);
    next(err);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, type, targetHostels, targetBlocks, targetRoles, isPinned, expiresAt } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if user can edit this announcement (only creator or management)
    if (
      !announcement.createdBy.equals(req.user._id) &&
      req.user.role.toLowerCase() !== 'management'
    ) {
      return res.status(403).json({ message: "Not allowed to edit this announcement" });
    }

    // Validate expiration date
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return res.status(400).json({ message: "Expiration date must be in the future" });
    }

    // Update fields
    if (title) announcement.title = title.trim();
    if (content) announcement.content = content.trim();
    if (type) announcement.type = type;
    if (targetHostels) announcement.targetHostels = targetHostels;
    if (targetBlocks !== undefined) announcement.targetBlocks = targetBlocks;
    if (targetRoles !== undefined) announcement.targetRoles = targetRoles;
    if (isPinned !== undefined) announcement.isPinned = isPinned;
    if (expiresAt !== undefined) announcement.expiresAt = expiresAt ? new Date(expiresAt) : undefined;

    await announcement.save();

    // Populate author details for response
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name role');

    res.json(populatedAnnouncement);
  } catch (err) {
    console.error('Error updating announcement:', err);
    next(err);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if user can delete this announcement (only creator or management)
    if (
      !announcement.createdBy.equals(req.user._id) &&
      req.user.role.toLowerCase() !== 'management'
    ) {
      return res.status(403).json({ message: "Not allowed to delete this announcement" });
    }

    await Announcement.findByIdAndDelete(id);

    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    next(err);
  }
};

// Middleware to check if user can create announcements
export const requireAnnouncementAccess = (req, res, next) => {
  const userRole = req.user.role.toLowerCase();
  console.log('Checking announcement access for user role:', userRole);
  
  if (userRole !== 'caretaker' && userRole !== 'management') {
    console.log('Access denied for role:', userRole);
    return res.status(403).json({ message: "Only caretaker and management can create announcements" });
  }
  
  console.log('Access granted for role:', userRole);
  next();
};
