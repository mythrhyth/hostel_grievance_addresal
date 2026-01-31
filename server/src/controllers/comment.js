import Comment from "../models/Comment.js";
import Issue from "../models/Issue.js";

export const getCommentsByIssueId = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Fetching comments for issue ID:', id);
    
    // Verify issue exists and user has access
    const issue = await Issue.findById(id);
    if (!issue) {
      console.log('Issue not found:', id);
      return res.status(404).json({ message: "Issue not found" });
    }

    console.log('Issue found, checking permissions for user:', req.user.role);

    // Check visibility permissions
    if (issue.visibility === "PRIVATE") {
      if (
        !issue.reportedBy.equals(req.user._id) &&
        req.user.role.toLowerCase() !== "caretaker" &&
        req.user.role.toLowerCase() !== "management"
      ) {
        console.log('Access denied to private issue');
        return res.status(403).json({ message: "Not allowed to view comments" });
      }
    }

    // Fetch comments with author details
    const comments = await Comment.find({ issueId: id })
      .populate('author', 'name role hostel block room')
      .sort({ createdAt: 1 }); // Oldest first for chronological reading

    console.log('Comments found:', comments.length);
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    next(err);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, isInternal = false } = req.body;

    // Basic validation
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    // Verify issue exists and user has access
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Check visibility permissions
    if (issue.visibility === "PRIVATE") {
      if (
        !issue.reportedBy.equals(req.user._id) &&
        req.user.role.toLowerCase() !== "caretaker" &&
        req.user.role.toLowerCase() !== "management"
      ) {
        return res.status(403).json({ message: "Not allowed to comment" });
      }
    }

    // Only management can create internal comments
    if (isInternal && req.user.role.toLowerCase() !== "management" && req.user.role.toLowerCase() !== "caretaker") {
      return res.status(403).json({ message: "Only management can create internal comments" });
    }

    // Create comment
    const comment = await Comment.create({
      content: content.trim(),
      issueId: id,
      author: req.user._id,
      isInternal
    });

    // Populate author details for response
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name role hostel block room');

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error('Error creating comment:', err);
    next(err);
  }
};

export const addReaction = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { type } = req.body;

    if (!['like', 'helpful', 'urgent'].includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Find existing reaction
    let reaction = comment.reactions.find(r => r.type === type);
    
    if (!reaction) {
      // Create new reaction
      reaction = {
        type,
        count: 0,
        users: []
      };
      comment.reactions.push(reaction);
    }

    // Check if user already reacted
    const userIndex = reaction.users.findIndex(u => u.equals(req.user._id));
    
    if (userIndex > -1) {
      // Remove reaction
      reaction.users.splice(userIndex, 1);
      reaction.count--;
    } else {
      // Add reaction
      reaction.users.push(req.user._id);
      reaction.count++;
    }

    // Clean up reactions with zero count
    comment.reactions = comment.reactions.filter(r => r.count > 0);

    await comment.save();

    res.json({ message: "Reaction updated", reactions: comment.reactions });
  } catch (err) {
    next(err);
  }
};
