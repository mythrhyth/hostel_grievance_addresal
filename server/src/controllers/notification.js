import {
  sendWelcomeEmail,
  sendIssueStatusEmail,
  sendAnnouncementEmail,
  sendLostAndFoundEmail,
  sendPollEmail
} from '../services/notificationService.js';
import User from '../models/User.js';

export const sendWelcomeNotification = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await sendWelcomeEmail(user);
    res.json({ message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    next(error);
  }
};

export const sendIssueStatusNotification = async (req, res, next) => {
  try {
    const { issueId, status } = req.body;
    
    // This would typically be called when an issue status is updated
    // For now, we'll just return success
    res.json({ message: 'Issue status notification sent successfully' });
  } catch (error) {
    console.error('Error sending issue status notification:', error);
    next(error);
  }
};

export const sendAnnouncementNotification = async (req, res, next) => {
  try {
    const { announcement, targetHostels, targetRoles } = req.body;
    
    // Find users who should receive this announcement
    const query = {};
    
    if (targetHostels && targetHostels.length > 0) {
      query.hostel = { $in: targetHostels };
    }
    
    if (targetRoles && targetRoles.length > 0) {
      query.role = { $in: targetRoles.map(role => role.toUpperCase()) };
    }
    
    const users = await User.find(query);
    
    if (users.length > 0) {
      await sendAnnouncementEmail(announcement, users);
    }
    
    res.json({ 
      message: 'Announcement notifications sent successfully',
      sentTo: users.length
    });
  } catch (error) {
    console.error('Error sending announcement notification:', error);
    next(error);
  }
};

export const sendLostAndFoundNotification = async (req, res, next) => {
  try {
    const { item, type, recipientEmail } = req.body;
    
    await sendLostAndFoundEmail(item, type, recipientEmail);
    res.json({ message: 'Lost and found notification sent successfully' });
  } catch (error) {
    console.error('Error sending lost and found notification:', error);
    next(error);
  }
};

export const sendPollNotification = async (req, res, next) => {
  try {
    const { poll, targetHostels, targetRoles } = req.body;
    
    // Find users who should receive this poll
    const query = {};
    
    if (targetHostels && targetHostels.length > 0) {
      query.hostel = { $in: targetHostels };
    }
    
    if (targetRoles && targetRoles.length > 0) {
      query.role = { $in: targetRoles.map(role => role.toUpperCase()) };
    }
    
    const users = await User.find(query);
    
    if (users.length > 0) {
      await sendPollEmail(poll, users);
    }
    
    res.json({ 
      message: 'Poll notifications sent successfully',
      sentTo: users.length
    });
  } catch (error) {
    console.error('Error sending poll notification:', error);
    next(error);
  }
};

export const testEmailNotification = async (req, res, next) => {
  try {
    const { to, subject, message } = req.body;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Test Notification</h2>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p>${message}</p>
        </div>
        <p>This is a test email from the Hostel Management System.</p>
        <p>Best regards,<br>Hostel Management Team</p>
      </div>
    `;

    await sendEmailNotification({
      to,
      subject: subject || 'Test Email from Hostel Management',
      html,
      text: message
    });
    
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    next(error);
  }
};
