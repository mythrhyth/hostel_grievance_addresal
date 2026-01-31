import Poll from "../models/Poll.js";
import mongoose from "mongoose";

export const createPoll = async (req, res, next) => {
  try {
    const { question, options, targetHostels, targetRoles, expiresAt } = req.body;

    // Basic validation
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Poll question is required" });
    }

    if (!options || options.length < 2) {
      return res.status(400).json({ message: "At least 2 options are required" });
    }

    if (!targetHostels || targetHostels.length === 0) {
      return res.status(400).json({ message: "At least one target hostel is required" });
    }

    // Validate options
    const validOptions = options.filter(opt => opt && opt.text && opt.text.trim());
    if (validOptions.length < 2) {
      return res.status(400).json({ message: "At least 2 valid options are required" });
    }

    // Role-based validation
    if (req.user.role === "CARETAKER") {
      // Caretakers can only create polls for their assigned hostels
      const caretakerHostels = req.user.hostels || [];
      
      const invalidHostels = targetHostels.filter(hostel => !caretakerHostels.includes(hostel));
      if (invalidHostels.length > 0) {
        return res.status(403).json({ 
          message: `Caretakers can only create polls for their assigned hostels. Invalid hostels: ${invalidHostels.join(', ')}` 
        });
      }

      // Caretakers can only target students
      if (targetRoles && targetRoles.length > 0) {
        const invalidRoles = targetRoles.filter(role => !['student'].includes(role.toLowerCase()));
        if (invalidRoles.length > 0) {
          return res.status(403).json({ 
            message: "Caretakers can only create polls for students" 
          });
        }
      }

      // Auto-set targetRoles to ['student'] for caretakers if not specified
      const finalTargetRoles = targetRoles && targetRoles.length > 0 ? targetRoles : ['student'];

      const poll = await Poll.create({
        question: question.trim(),
        options: validOptions.map(opt => ({ text: opt.text.trim(), votes: 0, voters: [] })),
        targetHostels,
        targetRoles: finalTargetRoles,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        createdBy: req.user._id,
        voters: []
      });

      const populatedPoll = await Poll.findById(poll._id)
        .populate('createdBy', 'name role')
        .populate('voters', 'name');

      res.status(201).json(populatedPoll);

    } else if (req.user.role === "MANAGEMENT") {
      // Management can create polls for any hostels and roles
      const poll = await Poll.create({
        question: question.trim(),
        options: validOptions.map(opt => ({ text: opt.text.trim(), votes: 0, voters: [] })),
        targetHostels,
        targetRoles: targetRoles || [],
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        createdBy: req.user._id,
        voters: []
      });

      const populatedPoll = await Poll.findById(poll._id)
        .populate('createdBy', 'name role')
        .populate('voters', 'name');

      res.status(201).json(populatedPoll);

    } else {
      return res.status(403).json({ message: "Only caretakers and management can create polls" });
    }

  } catch (err) {
    console.error('Error creating poll:', err);
    next(err);
  }
};

export const voteOnPoll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Poll ID is required" });
    }

    if (typeof optionIndex !== 'number' || optionIndex < 0) {
      return res.status(400).json({ message: "Valid option index is required" });
    }

    const poll = await Poll.findById(id)
      .populate('createdBy', 'name role')
      .populate('voters', 'name');

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if poll is active and not expired
    if (!poll.isActive) {
      return res.status(400).json({ message: "This poll is no longer active" });
    }

    if (poll.isExpired) {
      return res.status(400).json({ message: "This poll has expired" });
    }

    // Check if user has access to this poll
    const userRole = req.user.role.toLowerCase();
    const userHostel = req.user.hostel;
    
    if (!poll.targetHostels.includes(userHostel) && poll.targetHostels.length > 0) {
      return res.status(403).json({ message: "You don't have access to this poll" });
    }

    if (poll.targetRoles.length > 0 && !poll.targetRoles.includes(userRole)) {
      return res.status(403).json({ message: "You don't have access to this poll" });
    }

    // Check if user has already voted
    const userIdString = req.user._id ? req.user._id.toString() : req.user.id;
    const hasVoted = poll.voters.some(voter => voter._id.toString() === userIdString);

    if (hasVoted) {
      return res.status(400).json({ message: "You have already voted in this poll" });
    }

    // Check if option index is valid
    if (optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    // Add vote
    poll.options[optionIndex].votes += 1;
    poll.options[optionIndex].voters.push(req.user._id);
    poll.voters.push(req.user._id);

    await poll.save();

    res.json({
      message: "Vote recorded successfully",
      poll: {
        _id: poll._id,
        question: poll.question,
        options: poll.options,
        totalVotes: poll.totalVotes,
        userVoted: true,
        userVote: optionIndex
      }
    });

  } catch (err) {
    console.error('Error voting on poll:', err);
    next(err);
  }
};

export const getPolls = async (req, res, next) => {
  try {
    const { hostel, role } = req.user;
    const userRole = role.toLowerCase();
    
    // Build query based on user's role and hostel
    let query = {
      $or: [
        // Polls targeting all hostels
        { targetHostels: { $size: 0 } },
        // Polls targeting user's hostel
        { targetHostels: hostel }
      ],
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    // Filter by role if specified
    query.$and = [
      {
        $or: [
          // Polls targeting all roles
          { targetRoles: { $size: 0 } },
          // Polls targeting user's role
          { targetRoles: userRole }
        ]
      }
    ];

    const polls = await Poll.find(query)
      .populate('createdBy', 'name role')
      .populate('voters', 'name')
      .sort({ createdAt: -1 });

    // Add user-specific data to each poll
    const pollsWithUserData = polls.map(poll => ({
      ...poll.toObject(),
      totalVotes: poll.totalVotes,
      userVoted: poll.voters.some(voter => voter._id.toString() === req.user._id.toString()),
      isExpired: poll.isExpired
    }));

    res.json(pollsWithUserData);
  } catch (err) {
    console.error('Error fetching polls:', err);
    next(err);
  }
};

export const getPollById = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId)
      .populate('createdBy', 'name role')
      .populate('voters', 'name');

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if user has access to this poll
    const userRole = req.user.role.toLowerCase();
    const userHostel = req.user.hostel;
    
    if (!poll.targetHostels.includes(userHostel) && poll.targetHostels.length > 0) {
      return res.status(403).json({ message: "You don't have access to this poll" });
    }

    if (poll.targetRoles.length > 0 && !poll.targetRoles.includes(userRole)) {
      return res.status(403).json({ message: "You don't have access to this poll" });
    }

    res.json({
      ...poll.toObject(),
      totalVotes: poll.totalVotes,
      userVoted: poll.voters.some(voter => voter._id.toString() === req.user._id.toString()),
      isExpired: poll.isExpired
    });

  } catch (err) {
    console.error('Error fetching poll:', err);
    next(err);
  }
};
