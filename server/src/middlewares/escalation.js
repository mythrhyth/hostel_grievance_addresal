import Issue from "../models/Issue.js";

export const canEscalate = (req, res, next) => {
  const { issue, user } = req;

  if (user.role !== "CARETAKER") {
    return res.status(403).json({ message: "Only caretaker can escalate" });
  }

  if (issue.escalated) {
    return res.status(400).json({ message: "Already escalated" });
  }

  if (!["ASSIGNED", "IN_PROGRESS"].includes(issue.status)) {
    return res.status(400).json({ message: "Cannot escalate now" });
  }

  next();
};




export const loadIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    req.issue = issue;
    next();
  } catch (err) {
    next(err);
  }
};
