# Deployment Guide

This guide will help you deploy your Hostel Management System with both frontend and backend.

## 🚀 Deployment Options

### **Option 1: Vercel + Railway (Recommended)**
- **Frontend**: Vercel (Free tier)
- **Backend**: Railway (Free tier)
- **Database**: MongoDB Atlas (Free tier)
- **Email**: Gmail SMTP

### **Option 2: Netlify + Heroku**
- **Frontend**: Netlify (Free tier)
- **Backend**: Heroku (Free tier)
- **Database**: MongoDB Atlas (Free tier)

### **Option 3: DigitalOcean App Platform**
- **Frontend + Backend**: DigitalOcean (Single deployment)
- **Database**: MongoDB Atlas
- **All-in-one solution**

---

## 📋 Prerequisites

1. **Git Repository**: Your code should be on GitHub
2. **Domain Name** (Optional): Custom domain for your app
3. **Email Account**: For notifications (Gmail recommended)
4. **MongoDB Atlas Account**: For database hosting

---

## 🔧 Option 1: Vercel + Railway Deployment

### **Step 1: Setup MongoDB Atlas**

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (Free tier)
4. Create a database user
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/hostel_management?retryWrites=true&w=majority
   ```

### **Step 2: Deploy Backend to Railway**

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Configure deployment:

**Set Environment Variables:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hostel_management
JWT_SECRET=your_super_secure_jwt_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
PORT=5000
```

6. Click "Deploy"
7. Wait for deployment to complete
8. Note your Railway URL (e.g., `your-app.railway.app`)

### **Step 3: Configure Frontend for Production**

1. Update API base URL in frontend:

```typescript
// client/src/services/api.ts
const API_BASE_URL = 'https://your-app.railway.app/api';
```

2. Create `vercel.json` in client directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://your-app.railway.app/api"
  }
}
```

### **Step 4: Deploy Frontend to Vercel**

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   ```
   VITE_API_URL=https://your-app.railway.app/api
   ```
7. Click "Deploy"
8. Wait for deployment to complete

---

## 🌐 Option 2: Netlify + Heroku

### **Step 1: Deploy Backend to Heroku**

1. Install Heroku CLI
2. Login to Heroku:
   ```bash
   heroku login
   ```
3. Create Heroku app:
   ```bash
   heroku create your-app-name
   ```
4. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hostel_management
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set EMAIL_HOST=smtp.gmail.com
   heroku config:set EMAIL_PORT=587
   heroku config:set EMAIL_USER=your_email@gmail.com
   heroku config:set EMAIL_PASS=your_app_password
   ```
5. Deploy:
   ```bash
   git push heroku main
   ```

### **Step 2: Deploy Frontend to Netlify**

1. Go to [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Configure build settings:
   - **Build command**: `cd client && npm run build`
   - **Publish directory**: `client/dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-app-name.herokuapp.com/api
   ```
5. Deploy

---

## 🐳 Option 3: Docker Deployment

### **Step 1: Create Dockerfile**

**Backend Dockerfile** (`server/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

**Frontend Dockerfile** (`client/Dockerfile`):
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
events {}
http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  
  server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
      try_files $uri $uri/ /index.html;
    }
    
    location /api {
      proxy_pass http://backend:5000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
  }
}
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  backend:
    build: ./server
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb+srv://<username>:<password>@cluster.mongodb.net/hostel_management
      JWT_SECRET: your_jwt_secret
      EMAIL_HOST: smtp.gmail.com
      EMAIL_PORT: 587
      EMAIL_USER: your_email@gmail.com
      EMAIL_PASS: your_app_password
    depends_on:
      - db

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: mongo:latest
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

### **Step 2: Deploy to DigitalOcean**

1. Create DigitalOcean account
2. Create a Droplet with Docker
3. Clone your repository
4. Run:
   ```bash
   docker-compose up -d
   ```

---

## 🔧 Production Configuration

### **Backend Production Settings**

**server/package.json**:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "build": "echo 'No build step required for Node.js'"
  }
}
```

**server/src/server.js**:
```javascript
import app from './app.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });
```

### **Frontend Production Settings**

**client/vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@/components/ui']
        }
      }
    }
  },
  define: {
    'process.env': process.env
  }
})
```

---

## 📧 Email Setup for Production

### **Gmail App Password**

1. Enable 2-factor authentication on Gmail
2. Go to Google Account settings → Security
3. Select "App passwords"
4. Generate new app password
5. Use this password in `EMAIL_PASS` environment variable

### **Alternative Email Services**

**SendGrid**:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

**Mailgun**:
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@yourdomain.com
EMAIL_PASS=your_mailgun_password
```

---

## 🔒 Security Considerations

### **Environment Variables**
- Never commit `.env` files
- Use strong, unique secrets
- Rotate secrets regularly
- Use different secrets for production

### **CORS Configuration**
```javascript
// server/src/app.js
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://www.your-domain.com']
    : ['http://localhost:5173'],
  credentials: true
};

app.use(cors(corsOptions));
```

### **Rate Limiting**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Monitoring and Logging

### **Add Logging**
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'hostel-management' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### **Health Check Endpoint**
```javascript
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

---

## 🚀 Deployment Checklist

### **Pre-Deployment**
- [ ] Update all dependencies
- [ ] Set production environment variables
- [ ] Configure database connection
- [ ] Set up email service
- [ ] Test all functionality locally

### **Deployment**
- [ ] Deploy backend first
- [ ] Test backend API endpoints
- [ ] Update frontend API URL
- [ ] Deploy frontend
- [ ] Test full application

### **Post-Deployment**
- [ ] Monitor error logs
- [ ] Test all user flows
- [ ] Verify email notifications
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy

---

## 🛠️ Troubleshooting

### **Common Issues**

**CORS Errors**:
```javascript
// Make sure your frontend domain is in CORS whitelist
const corsOptions = {
  origin: ['https://your-domain.com', 'https://www.your-domain.com']
};
```

**Database Connection**:
```javascript
// Check MongoDB Atlas IP whitelist
// Verify connection string format
// Ensure database user has correct permissions
```

**Email Not Sending**:
```javascript
// Verify Gmail app password
// Check email configuration
// Review error logs
```

**Build Failures**:
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📞 Support

### **Deployment Services Support**
- **Vercel**: [Vercel Docs](https://vercel.com/docs)
- **Railway**: [Railway Docs](https://docs.railway.app)
- **Netlify**: [Netlify Docs](https://docs.netlify.com)
- **Heroku**: [Heroku Dev Center](https://devcenter.heroku.com)

### **Database Support**
- **MongoDB Atlas**: [Atlas Documentation](https://docs.atlas.mongodb.com)

---

**Your Hostel Management System is now ready for production deployment!** 🚀

Choose the deployment option that best fits your needs and budget. The Vercel + Railway option is recommended for most users due to its simplicity and generous free tiers.
