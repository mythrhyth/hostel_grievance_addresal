# Hostel Management System

A comprehensive hostel management system built with Node.js, Express, MongoDB, and React that streamlines hostel operations including issue reporting, announcements, polls, and lost & found item management.

## 🏗️ Architecture

### **Backend (Node.js + Express + MongoDB)**
- **Framework**: Express.js with ES6 modules
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **File Uploads**: Multer for image uploads
- **Email Service**: Nodemailer for notifications
- **Role-based Access**: Students, Caretakers, Management

### **Frontend (React + TypeScript + Tailwind CSS)**
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router
- **UI Components**: Custom component library

### **Database Schema**
- **Users**: Role-based user management (students, caretakers, management)
- **Issues**: Issue tracking with categories, priorities, and status
- **Announcements**: Targeted announcements with poll support
- **Polls**: Interactive polls with voting and expiration
- **Lost & Found**: Item tracking with claim functionality

## 🚀 Features

### **👤 User Management**
- **Role-based Authentication**: Students, Caretakers, Management
- **Profile Management**: Update personal information and contact details
- **Hostel Assignment**: Automatic hostel and room assignment
- **Secure Registration**: Email verification and password hashing

### **🐛 Issue Reporting System**
- **Issue Categories**: Plumbing, Electrical, Internet, Cleaning, Furniture, Security, Pest Control
- **Priority Levels**: Low, Medium, High, Emergency
- **Status Tracking**: Reported → Assigned → In Progress → Resolved → Closed
- **File Attachments**: Upload images and documents
- **Comments & Updates**: Track issue progress
- **Role-based Assignment**: Caretakers and management can assign issues

### **📢 Announcements & Polls**
- **Targeted Announcements**: Send to specific hostels and roles
- **Interactive Polls**: Create polls with multiple choice options
- **Voting System**: Real-time voting with expiration dates
- **Pin Important**: Keep critical announcements at top
- **Rich Content**: Support for text, images, and formatting

### **🔍 Lost & Found**
- **Item Reporting**: Report lost or found items with details
- **Contact Information**: Secure contact details exchange
- **Claim System**: Users can claim found items
- **Search & Filter**: Find items by category, location, or status
- **Image Uploads**: Add photos of lost/found items
- **Status Tracking**: Active → Claimed → Resolved

### **📧 Email Notifications**
- **Welcome Emails**: Automatic welcome for new users
- **Announcement Alerts**: Email notifications for new announcements
- **Issue Updates**: Status change notifications
- **Lost & Found**: Claim and item report notifications
- **Poll Notifications**: New poll alerts for targeted users

### **🎨 User Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes
- **Dashboard Layout**: Role-based dashboard views
- **Real-time Updates**: Live status updates without refresh
- **Accessibility**: WCAG compliant design

## 🛠️ Technology Stack

### **Backend Dependencies**
```json
{
  "express": "^5.2.1",
  "mongoose": "^9.1.5",
  "jsonwebtoken": "^9.0.3",
  "bcrypt": "^6.0.0",
  "multer": "^2.0.2",
  "nodemailer": "^6.9.7",
  "cors": "^2.8.6",
  "dotenv": "^17.2.3"
}
```

### **Frontend Dependencies**
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "axios": "^1.6.0",
  "react-router-dom": "^6.8.0",
  "date-fns": "^2.30.0",
  "sonner": "^1.4.0",
  "lucide-react": "^0.292.0"
}
```

## 📋 Setup Instructions

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB 5.0+
- Git

### **1. Clone the Repository**
```bash
git clone git@github.com:mythrhyth/hostel_grievance_addresal.git
cd hostel_grievance_addresal
```

### **2. Backend Setup**
```bash
cd server
npm install
cp .env.example .env
```

### **3. Configure Environment Variables**
Edit `.env` file in `server` directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/hostel_management

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Email (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Server
PORT=5000
NODE_ENV=development
```

### **4. Frontend Setup**
```bash
cd client
npm install
```

### **5. Start MongoDB**
```bash
mongod
```

### **6. Run the Application**
```bash
# Start backend (in server directory)
npm run dev

# Start frontend (in client directory)
npm run dev
```

### **7. Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

## 🏢 Project Structure

```
hostel_grievance_addresal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── public/
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Express middlewares
│   │   ├── services/      # Business logic services
│   │   └── utils/         # Utility functions
│   ├── uploads/           # File upload directory
│   ├── .env.example       # Environment variables template
│   └── package.json
├── docs/                  # Documentation
├── .gitignore
└── README.md
```

## 🔐 Authentication & Authorization

### **User Roles**
- **Students**: Can report issues, view announcements, vote in polls, report lost & found items
- **Caretakers**: Can manage issues, create announcements/polls, manage lost & found
- **Management**: Full system access, user management, system configuration

### **JWT Authentication**
- **Token-based**: Secure JWT tokens for API access
- **Role-based**: Different permissions based on user role
- **Expiration**: Configurable token expiration
- **Refresh**: Automatic token refresh mechanism

### **Security Features**
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: Prevent brute force attacks
- **CORS**: Cross-origin resource sharing configuration

## 📊 Database Schema

### **User Model**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['STUDENT', 'CARETAKER', 'MANAGEMENT'],
  hostel: String,
  block: String,
  room: String,
  phone: String,
  hostels: [String], // For caretakers
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Issue Model**
```javascript
{
  title: String,
  description: String,
  category: String,
  priority: ['low', 'medium', 'high', 'emergency'],
  status: ['reported', 'assigned', 'in_progress', 'resolved', 'closed'],
  reporter: ObjectId (ref: 'User'),
  assignee: ObjectId (ref: 'User'),
  hostel: String,
  block: String,
  room: String,
  images: [String],
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### **Announcement Model**
```javascript
{
  title: String,
  content: String,
  type: ['info', 'warning', 'urgent', 'maintenance'],
  targetHostels: [String],
  targetRoles: [String],
  targetBlocks: [String],
  createdBy: ObjectId (ref: 'User'),
  isPinned: Boolean,
  expiresAt: Date,
  poll: ObjectId (ref: 'Poll'),
  hasPoll: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 📧 Email Configuration

### **Gmail Setup (Recommended)**
1. Enable 2-factor authentication
2. Generate app password
3. Configure environment variables

### **Other Email Providers**
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Custom SMTP**: Provider-specific settings

### **Notification Types**
- Welcome emails for new users
- Announcement notifications
- Issue status updates
- Lost & found notifications
- Poll notifications

## 🧪 Testing

### **Run Tests**
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### **Email Testing**
```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "message": "Test message"
  }'
```

### **API Testing**
```bash
# Health check
curl http://localhost:5000/api/health

# Get announcements
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/announcements
```

## 🚀 Deployment

### **Development**
```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

### **Production**
```bash
# Build frontend
cd client
npm run build

# Start production server
cd server
npm start
```

### **Docker Deployment**
```bash
# Build and run with Docker
docker-compose up -d
```

### **Environment Variables**
- `NODE_ENV`: Set to 'production'
- `MONGODB_URI`: Production MongoDB connection string
- `JWT_SECRET`: Secure JWT secret
- `EMAIL_*`: Email service configuration

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Submit pull request
5. Code review and merge

### **Code Style**
- Use ESLint and Prettier
- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic

### **Testing**
- Unit tests for controllers and services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Accessibility testing

## 📚 API Documentation

### **Authentication Endpoints**
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
GET  /api/auth/profile     - Get user profile
PUT  /api/auth/profile     - Update user profile
```

### **Issue Management**
```
GET    /api/issues           - Get all issues
POST   /api/issues           - Create new issue
GET    /api/issues/:id       - Get specific issue
PATCH  /api/issues/:id       - Update issue
DELETE /api/issues/:id       - Delete issue
```

### **Announcements**
```
GET    /api/announcements    - Get announcements
POST   /api/announcements    - Create announcement
GET    /api/announcements/:id - Get specific announcement
PATCH  /api/announcements/:id - Update announcement
DELETE /api/announcements/:id - Delete announcement
```

### **Polls**
```
GET    /api/polls           - Get polls
POST   /api/polls           - Create poll
GET    /api/polls/:id       - Get specific poll
POST   /api/polls/:id/vote  - Vote on poll
```

### **Lost & Found**
```
GET    /api/lost-and-found    - Get all items
POST   /api/lost-and-found    - Report item
GET    /api/lost-and-found/:id - Get specific item
PATCH  /api/lost-and-found/:id - Update item
DELETE /api/lost-and-found/:id - Delete item
POST   /api/lost-and-found/:id/claim - Claim item
```

## 🔧 Configuration

### **Environment Variables**
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_USER`: Email username
- `EMAIL_PASS`: Email password
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

### **Database Configuration**
- **Connection**: MongoDB with Mongoose
- **Indexes**: Optimized indexes for performance
- **Validation**: Schema validation with Mongoose
- **Relationships**: Proper foreign key relationships

## 🐛 Troubleshooting

### **Common Issues**

#### **Database Connection**
```bash
# Check MongoDB status
mongod --status

# Verify connection string
echo $MONGODB_URI
```

#### **Email Issues**
```bash
# Test email configuration
node -e "require('dotenv').config(); console.log(process.env.EMAIL_USER)"
```

#### **Port Conflicts**
```bash
# Check port usage
netstat -tulpn | grep :5000

# Kill process on port
kill -9 <PID>
```

#### **Build Issues**
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install
```

### **Debug Mode**
```bash
# Enable debug logging
NODE_ENV=development npm run dev
```

## 📈 Performance

### **Optimizations**
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis for frequently accessed data
- **Compression**: Gzip compression for API responses
- **Lazy Loading**: Load data on demand
- **Image Optimization**: Compressed and optimized images

### **Monitoring**
- **API Response Times**: Track endpoint performance
- **Database Queries**: Monitor slow queries
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Track user engagement

## 📄 License

This project is licensed under the ISC License.

## 👥 Team

- **Backend Development**: Node.js, Express, MongoDB
- **Frontend Development**: React, TypeScript, Tailwind CSS
- **UI/UX Design**: Modern, responsive interface
- **System Architecture**: Scalable microservices-ready design

## 🎯 Future Enhancements

- **Mobile App**: React Native mobile application
- **Real-time Chat**: WebSocket-based communication
- **Analytics Dashboard**: Advanced reporting and analytics
- **Payment Integration**: Fee payment system
- **IoT Integration**: Smart hostel features
- **Multi-tenant**: Support for multiple hostels

---

## 📞 Support

For support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation
- Review the troubleshooting guide


**Built with ❤️ for hostel management excellence**
