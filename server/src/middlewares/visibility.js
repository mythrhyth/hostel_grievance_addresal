export const checkVisibility = (req, res, next) => {
  const { issue } = req;

  if (issue.visibility === "PRIVATE") {
    if (
      issue.reportedBy.equals(req.user._id) ||
      req.user.role === "CARETAKER" ||
      req.user.role === "MANAGEMENT"
    ) {
      return next();
    }
    return res.status(403).json({ message: "Not allowed" });
  }

  next();
};
