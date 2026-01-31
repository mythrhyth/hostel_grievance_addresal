import { ALLOWED_TRANSITIONS } from "../utils/lifecycle.js";

export const validateStatusChange = (req, res, next) => {
  const issue = req.issue;
  const user = req.user;
  const { newStatus } = req.body;

  // Allow same status (no change)
  if (issue.status === newStatus) {
    return next();
  }

  // Management override (optional)
  if (user.role === "MANAGEMENT") {
    return next();
  }

  // STUDENT rules
  if (user.role === "STUDENT") {
    if (
      issue.status === "RESOLVED" &&
      newStatus === "CLOSED" &&
      issue.reportedBy.equals(user._id)
    ) {
      return next();
    }

    return res.status(403).json({
      message: "Students cannot change issue status"
    });
  }

  // CARETAKER rules
  if (user.role === "CARETAKER") {
    const allowedNext = ALLOWED_TRANSITIONS[issue.status] || [];

    if (!allowedNext.includes(newStatus)) {
      return res.status(400).json({
        message: `Cannot change status from ${issue.status} to ${newStatus}`
      });
    }

    return next();
  }

  return res.status(403).json({ message: "Invalid role" });
};
