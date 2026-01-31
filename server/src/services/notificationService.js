import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email notification
export const sendEmailNotification = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Hostel Management" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Hostel Management System';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Welcome to Hostel Management System</h2>
      <p>Dear ${user.name},</p>
      <p>Welcome to the Hostel Management System! Your account has been successfully created.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Your Account Details:</h3>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Hostel:</strong> ${user.hostel}</p>
        ${user.room ? `<p><strong>Room:</strong> ${user.room}</p>` : ''}
        ${user.block ? `<p><strong>Block:</strong> ${user.block}</p>` : ''}
      </div>
      <p>You can now:</p>
      <ul>
        <li>Report issues in your hostel</li>
        <li>Track issue status</li>
        <li>View announcements</li>
        <li>Report lost and found items</li>
        <li>Participate in polls</li>
      </ul>
      <p>If you have any questions, please contact the hostel administration.</p>
      <p>Best regards,<br>Hostel Management Team</p>
    </div>
  `;

  return await sendEmailNotification({
    to: user.email,
    subject,
    html,
    text: `Welcome to Hostel Management System! Your account has been created with role: ${user.role}`
  });
};

// Send issue status update email
export const sendIssueStatusEmail = async (issue, status) => {
  const subject = `Issue Status Update: ${issue.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Issue Status Update</h2>
      <p>Dear ${issue.reporter.name},</p>
      <p>Your issue "<strong>${issue.title}</strong>" has been updated.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Issue Details:</h3>
        <p><strong>Title:</strong> ${issue.title}</p>
        <p><strong>Status:</strong> <span style="color: ${getStatusColor(status)}; font-weight: bold;">${status}</span></p>
        <p><strong>Category:</strong> ${issue.category}</p>
        <p><strong>Priority:</strong> ${issue.priority}</p>
        <p><strong>Location:</strong> ${issue.hostel}, Block ${issue.block}, Room ${issue.room}</p>
        <p><strong>Description:</strong> ${issue.description}</p>
      </div>
      <p>You can track the status of your issue in the Hostel Management System.</p>
      <p>Best regards,<br>Hostel Management Team</p>
    </div>
  `;

  return await sendEmailNotification({
    to: issue.reporter.email,
    subject,
    html,
    text: `Your issue "${issue.title}" status has been updated to: ${status}`
  });
};

// Send announcement notification
export const sendAnnouncementEmail = async (announcement, users) => {
  const subject = `New Announcement: ${announcement.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">New Announcement</h2>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>${announcement.title}</h3>
        <p><strong>Type:</strong> ${announcement.type}</p>
        <p><strong>Posted by:</strong> ${announcement.createdBy.name}</p>
        <p><strong>Date:</strong> ${new Date(announcement.createdAt).toLocaleDateString()}</p>
        <div style="margin-top: 15px;">
          <strong>Message:</strong><br>
          ${announcement.content}
        </div>
      </div>
      <p>Please check the Hostel Management System for more details.</p>
      <p>Best regards,<br>Hostel Management Team</p>
    </div>
  `;

  // Send to all targeted users
  const emailPromises = users.map(user => 
    sendEmailNotification({
      to: user.email,
      subject,
      html,
      text: `New announcement: ${announcement.title}`
    })
  );

  return await Promise.all(emailPromises);
};

// Send lost and found notification
export const sendLostAndFoundEmail = async (item, type, recipientEmail) => {
  const subject = type === 'claimed' 
    ? `Lost & Found Item Claimed: ${item.title}`
    : `New Lost & Found Item: ${item.title}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">${type === 'claimed' ? 'Item Claimed' : 'New Lost & Found Item'}</h2>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>${item.title}</h3>
        <p><strong>Type:</strong> ${item.type}</p>
        <p><strong>Category:</strong> ${item.category}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><strong>Date:</strong> ${new Date(item.dateLostOrFound).toLocaleDateString()}</p>
        <p><strong>Description:</strong> ${item.description}</p>
        ${item.contactInfo ? `
          <div style="margin-top: 15px;">
            <strong>Contact Information:</strong><br>
            ${item.contactInfo.name}<br>
            ${item.contactInfo.phone}<br>
            ${item.contactInfo.email}
          </div>
        ` : ''}
      </div>
      ${type === 'claimed' ? 
        `<p>Your item has been claimed! Please contact the person who claimed it to arrange pickup.</p>` :
        `<p>A new ${item.type} item has been reported. Please check if it belongs to you.</p>`
      }
      <p>Best regards,<br>Hostel Management Team</p>
    </div>
  `;

  return await sendEmailNotification({
    to: recipientEmail,
    subject,
    html,
    text: `${type === 'claimed' ? 'Your item has been claimed' : 'New lost and found item reported'}: ${item.title}`
  });
};

// Helper function to get status color
const getStatusColor = (status) => {
  const colors = {
    reported: '#ff9800',
    assigned: '#2196f3',
    in_progress: '#9c27b0',
    resolved: '#4caf50',
    closed: '#9e9e9e'
  };
  return colors[status] || '#666';
};

// Send poll notification
export const sendPollEmail = async (poll, users) => {
  const subject = `New Poll: ${poll.question}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">New Poll Available</h2>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>${poll.question}</h3>
        <p><strong>Created by:</strong> ${poll.createdBy.name}</p>
        <p><strong>Expires:</strong> ${poll.expiresAt ? new Date(poll.expiresAt).toLocaleDateString() : 'No expiration'}</p>
        <div style="margin-top: 15px;">
          <strong>Options:</strong><br>
          ${poll.options.map((option, index) => `${index + 1}. ${option.text}`).join('<br>')}
        </div>
      </div>
      <p>Please participate in this poll by visiting the Hostel Management System.</p>
      <p>Best regards,<br>Hostel Management Team</p>
    </div>
  `;

  // Send to all targeted users
  const emailPromises = users.map(user => 
    sendEmailNotification({
      to: user.email,
      subject,
      html,
      text: `New poll: ${poll.question}`
    })
  );

  return await Promise.all(emailPromises);
};

export default {
  sendEmailNotification,
  sendWelcomeEmail,
  sendIssueStatusEmail,
  sendAnnouncementEmail,
  sendLostAndFoundEmail,
  sendPollEmail
};
