import Issue from "../models/Issue.js";

export const loadIssue = async (req, res, next) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) {
    return res.status(404).json({ message: "Issue not found" });
  }
  req.issue = issue;
  next();
};
