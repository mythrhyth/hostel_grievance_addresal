import IssueLog from "../models/IssueLog.js";

export const getIssueLogs = async (req, res, next) => {
  try {
    console.log('Fetching logs for issue:', req.issue._id);
    const logs = await IssueLog.find({ issueId: req.issue._id })
      .sort({ timestamp: 1 })
      .populate('changedBy', 'name role');

    console.log('Found logs:', logs);
    res.json(logs);
  } catch (err) {
    console.error('Error fetching issue logs:', err);
    next(err);
  }
};
