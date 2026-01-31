import Issue from "../models/Issue.js";
import User from "../models/User.js";
import IssueLog from "../models/IssueLog.js";

export const getIssueStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build base query based on user role
    let baseQuery = {};
    if (userRole === 'STUDENT') {
      baseQuery = {
        $or: [
          { reportedBy: userId },
          { spaceType: 'PUBLIC' },
          { 
            spaceType: 'PRIVATE', 
            hostel: req.user.hostel, 
            block: req.user.block 
          }
        ]
      };
    }

    // Get total counts
    const totalIssues = await Issue.countDocuments(baseQuery);
    const pendingIssues = await Issue.countDocuments({ ...baseQuery, status: 'OPEN' });
    const resolvedIssues = await Issue.countDocuments({ ...baseQuery, status: 'RESOLVED' });

    // Calculate average resolution time (in hours)
    const resolvedIssuesData = await Issue.find({ 
      ...baseQuery, 
      status: 'RESOLVED',
      resolvedAt: { $exists: true }
    }).select('createdAt resolvedAt');

    let avgResolutionTime = 0;
    if (resolvedIssuesData.length > 0) {
      const totalResolutionTime = resolvedIssuesData.reduce((sum, issue) => {
        const resolutionTime = issue.resolvedAt - issue.createdAt;
        return sum + resolutionTime;
      }, 0);
      avgResolutionTime = Math.round(totalResolutionTime / resolvedIssuesData.length / (1000 * 60 * 60)); // Convert to hours
    }

    // Get issues by category
    const issuesByCategory = await Issue.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);

    // Get recent trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentTrend = await Issue.aggregate([
      { 
        $match: { 
          ...baseQuery,
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          reported: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', reported: 1, resolved: 1, _id: 0 } }
    ]);

    res.json({
      totalIssues,
      pendingIssues,
      resolvedIssues,
      avgResolutionTime,
      issuesByCategory,
      recentTrend
    });
  } catch (err) {
    next(err);
  }
};

export const assignUnassignedIssues = async (req, res, next) => {
  try {
    // Find all unassigned issues (status: REPORTED)
    const unassignedIssues = await Issue.find({ status: "REPORTED" });
    
    console.log(`Found ${unassignedIssues.length} unassigned issues to process`);
    
    let assignedCount = 0;
    let skippedCount = 0;
    
    for (const issue of unassignedIssues) {
      const issueHostel = issue.hostel;
      
      // Find caretakers for this hostel
      const caretakers = await User.find({
        role: "CARETAKER",
        hostels: { $in: [issueHostel] }
      });
      
      if (caretakers.length > 0) {
        // Calculate current load for each caretaker
        const caretakerLoads = await Promise.all(
          caretakers.map(async (caretaker) => {
            const count = await Issue.countDocuments({
              assignedTo: caretaker._id,
              status: { $nin: ["RESOLVED", "CLOSED"] }
            });
            return { caretaker, count };
          })
        );
        
        // Sort by load and select least busy caretaker
        caretakerLoads.sort((a, b) => a.count - b.count);
        const selectedCaretaker = caretakerLoads[0].caretaker;
        
        // Assign the issue
        issue.assignedTo = selectedCaretaker._id;
        issue.status = "ASSIGNED";
        await issue.save();
        
        // Log the assignment
        await IssueLog.create({
          issueId: issue._id,
          fromStatus: "REPORTED",
          toStatus: "ASSIGNED",
          changedBy: selectedCaretaker._id,
          remarks: `Bulk auto-assigned to caretaker ${selectedCaretaker.name} of ${issueHostel}`
        });
        
        assignedCount++;
        console.log(`Assigned issue ${issue._id} to ${selectedCaretaker.name}`);
      } else {
        skippedCount++;
        console.log(`No caretakers available for hostel ${issueHostel}, issue ${issue._id} remains unassigned`);
      }
    }
    
    res.json({
      message: "Bulk assignment completed",
      totalProcessed: unassignedIssues.length,
      assigned: assignedCount,
      skipped: skippedCount
    });
  } catch (err) {
    next(err);
  }
};

export const createIssue = async (req, res, next) => {
  try {
    // Basic validation to provide helpful errors instead of 500s
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Missing required fields: title, description or category' });
    }

    // Normalize spaceType and validate
    const spaceType = String(req.body.spaceType || 'PUBLIC').toUpperCase();
    if (!['PUBLIC', 'PRIVATE'].includes(spaceType)) {
      return res.status(400).json({ message: 'Invalid spaceType. Must be PUBLIC or PRIVATE' });
    }

    const block = req.body.block || req.user.block;
    if (!block) {
      return res.status(400).json({ message: 'Block is required' });
    }

    const roomValue = spaceType === 'PRIVATE' ? (req.body.room || req.user.room) : undefined;
    if (spaceType === 'PRIVATE' && !roomValue) {
      return res.status(400).json({ message: 'Room is required for PRIVATE spaceType' });
    }

    const issue = await Issue.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority || 'low',
      spaceType,
      visibility: spaceType === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC', // Explicitly set visibility
      hostel: req.user.hostel || req.body.hostel,
      block,
      room: roomValue,
      reportedBy: req.user._id,
      status: "REPORTED"
    });

    // Auto-assign to caretaker for this hostel
    const issueHostel = req.user.hostel || req.body.hostel;
    console.log(`Auto-assigning issue in hostel: ${issueHostel}`);
    
    const caretakers = await User.find({
      role: "CARETAKER",
      hostels: { $in: [issueHostel] } // Find caretakers assigned to this hostel
    });

    console.log(`Found ${caretakers.length} caretakers for hostel ${issueHostel}`);

    if (caretakers.length > 0) {
      // Calculate current load for each caretaker (only active issues)
      const caretakerLoads = await Promise.all(
        caretakers.map(async (caretaker) => {
          const count = await Issue.countDocuments({
            assignedTo: caretaker._id,
            status: { $nin: ["RESOLVED", "CLOSED"] }
          });
          return { caretaker, count };
        })
      );

      // Sort by load (ascending) and select the least busy caretaker
      caretakerLoads.sort((a, b) => a.count - b.count);
      const selectedCaretaker = caretakerLoads[0].caretaker;

      console.log(`Assigning issue to caretaker: ${selectedCaretaker.name}`);

      // Assign the issue
      issue.assignedTo = selectedCaretaker._id;
      issue.status = "ASSIGNED";
      await issue.save();

      // Log the assignment
      await IssueLog.create({
        issueId: issue._id,
        fromStatus: "REPORTED",
        toStatus: "ASSIGNED",
        changedBy: selectedCaretaker._id,
        remarks: `Auto-assigned to caretaker ${selectedCaretaker.name} of ${issueHostel}`
      });

      console.log(`Issue ${issue._id} assigned successfully`);
    } else {
      console.log(`No caretakers available for hostel ${issueHostel}, issue remains unassigned`);
      // Issue remains in "REPORTED" status if no caretakers are available
    }

    res.status(201).json(issue);
  } catch (err) {
    next(err);
  }
};
export const updateIssueStatus = async (req, res, next) => {
  try {
    const issue = req.issue;
    const { newStatus, remarks } = req.body;

    // 🔑 store old status BEFORE changing
    const oldStatus = issue.status;

    // update status
    issue.status = newStatus;
    await issue.save();

    // log status change
    await IssueLog.create({
      issueId: issue._id,
      fromStatus: oldStatus,
      toStatus: newStatus,
      changedBy: req.user._id,
      remarks
    });

    res.json({ message: "Status updated", issue });
  } catch (err) {
    next(err);
  }
};

export const escalateIssue = async (req, res, next) => {
  try {
    const issue = req.issue;

    issue.escalation = {
      level: "HMC",
      escalatedBy: req.user._id,
      escalatedAt: new Date(),
      reason: req.body.reason || "Escalated to HMC"
    };

    await issue.save();

    await IssueLog.create({
      issueId: issue._id,
      fromStatus: issue.status,
      toStatus: "ESCALATED",
      changedBy: req.user._id,
      remarks: issue.escalation.reason
    });

    res.json({ message: "Issue escalated to HMC", issue });
  } catch (err) {
    next(err);
  }
};

export const getIssueById = async (req, res, next) => {
  try {
    // Populate user details for reporter and assignee
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name role hostel block room')
      .populate('assignedTo', 'name role hostel block room');
    
    res.json(issue);
  } catch (err) {
    next(err);
  }
};
export const getIssues = async (req, res, next) => {
  try {
    let query = {};

    
    if (req.user.role === "MANAGEMENT") {
      query = {};
    }

    
    else if (req.user.role === "CARETAKER") {
      query = {
        $or: [
          { assignedTo: req.user._id },
          { visibility: "PUBLIC" }
        ]
      };
    }

    
    else {
      query = {
        $or: [
          { reportedBy: req.user._id },
          { visibility: "PUBLIC" }
        ]
      };
    }

    

    if (req.query.mine === "true") {
      query = { reportedBy: req.user._id };
    }

    if (req.query.assigned === "true") {
      query = { assignedTo: req.user._id };
    }

    if (req.query.escalated === "true") {
      query["escalation.level"] = { $ne: "NONE" };
    }

    // Handle pagination and sorting
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const issues = await Issue.find(query)
      .sort(sort)
      .limit(limit)
      .populate('reportedBy', 'name role hostel block room')
      .populate('assignedTo', 'name role hostel block room');

    res.json(issues);
  } catch (err) {
    next(err);
  }
};

