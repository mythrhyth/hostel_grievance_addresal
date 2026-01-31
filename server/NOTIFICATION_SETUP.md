# Email Notifications Setup Guide

This guide will help you configure email notifications for the Hostel Management System.

## 📧 Email Service Configuration

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Email Settings

Create a `.env` file in the `server` directory based on `.env.example`:

```env
# Email Configuration (Notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

### 3. Gmail Setup (Recommended)

#### Option A: Gmail with App Password
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings → Security
3. Under "Signing in to Google", select "App passwords"
4. Generate a new app password for your application
5. Use the app password in `EMAIL_PASS`

#### Option B: Other Email Providers
- **Outlook/Hotmail**: Use `smtp-mail.outlook.com` as host, port 587
- **Yahoo Mail**: Use `smtp.mail.yahoo.com` as host, port 587
- **Custom SMTP**: Use your provider's SMTP settings

### 4. Test Email Configuration

Send a test email to verify everything works:

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test email from the Hostel Management System"
  }'
```

## 🎯 Notification Types

### 1. Welcome Emails
- **Trigger**: New user registration
- **Recipients**: New users
- **Content**: Account details and system overview

### 2. Announcement Emails
- **Trigger**: New announcement created
- **Recipients**: Targeted users based on hostels/roles
- **Content**: Announcement details and link to system

### 3. Issue Status Emails
- **Trigger**: Issue status changes
- **Recipients**: Issue reporter
- **Content**: Status update and next steps

### 4. Lost & Found Emails
- **Trigger**: Item claimed or new item reported
- **Recipients**: Item owner or finder
- **Content**: Claim details or item information

### 5. Poll Emails
- **Trigger**: New poll created
- **Recipients**: Targeted users
- **Content**: Poll question and voting instructions

## 🔧 Notification Service Features

### Email Templates
- Professional HTML email templates
- Responsive design for mobile devices
- Branded with Hostel Management styling
- Plain text fallback for email clients

### Error Handling
- Graceful error handling for email failures
- Server logs for debugging
- Non-blocking email sending (doesn't slow down API responses)

### Security
- Environment variables for sensitive data
- No hardcoded credentials
- App passwords for Gmail (more secure than regular passwords)

## 🚀 Usage Examples

### Send Welcome Email
```javascript
import { sendWelcomeEmail } from './services/notificationService.js';

await sendWelcomeEmail(user);
```

### Send Announcement Notification
```javascript
import { sendAnnouncementEmail } from './services/notificationService.js';

await sendAnnouncementEmail(announcement, targetHostels, targetRoles);
```

### Send Custom Email
```javascript
import { sendEmailNotification } from './services/notificationService.js';

await sendEmailNotification({
  to: 'user@example.com',
  subject: 'Custom Notification',
  html: '<h1>Custom HTML Content</h1>',
  text: 'Plain text content'
});
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Invalid login credentials" Error
- **Cause**: Incorrect email or app password
- **Solution**: Verify Gmail app password is correct

#### 2. "Connection timeout" Error
- **Cause**: Firewall or network issues
- **Solution**: Check SMTP port (587) and allowlist

#### 3. "Email not sent" but no error
- **Cause**: Email sent to spam folder
- **Solution**: Check spam/junk folders

#### 4. "Module not found: nodemailer"
- **Cause**: Dependencies not installed
- **Solution**: Run `npm install` in server directory

### Debug Mode
Add this to your `.env` file for debugging:
```env
NODE_ENV=development
```

This will enable detailed logging for email operations.

## 📱 Email Client Configuration

### Gmail Settings
- **SMTP Server**: smtp.gmail.com
- **Port**: 587 (TLS)
- **Authentication**: Normal Password
- **Username**: Your Gmail address
- **Password**: Your Gmail app password

### Outlook Settings
- **SMTP Server**: smtp-mail.outlook.com
- **Port**: 587 (STARTTLS)
- **Authentication**: Normal Password
- **Username**: Your Outlook email
- **Password**: Your Outlook password

## 🔐 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use app passwords** instead of regular passwords
3. **Rotate email credentials** regularly
4. **Monitor email sending logs** for unusual activity
5. **Use environment-specific email accounts** (dev vs prod)

## 📊 Monitoring

### Email Metrics
- Track delivery success rates
- Monitor bounce rates
- Log failed deliveries
- Analyze open rates (if using email tracking service)

### Server Logs
```javascript
// Check server logs for email status
console.log('Email sent successfully:', info.messageId);
console.error('Error sending email:', error);
```

## 🎉 Next Steps

1. Configure your email settings in `.env`
2. Test email functionality with the test endpoint
3. Verify welcome emails work on new user registration
4. Test announcement notifications
5. Monitor email delivery in production

Your notification system is now ready to keep users informed about important hostel activities! 🚀
