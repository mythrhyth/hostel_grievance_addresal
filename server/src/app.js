import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import issueRoutes from "./routes/issue.js";
import announcementRoutes from "./routes/announcement.js";
import lostAndFoundRoutes from "./routes/lostAndFound.js";
import pollRoutes from "./routes/poll.js";
import notificationRoutes from "./routes/notification.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.js";
dotenv.config();
import authRoutes from "./routes/auth.js";

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allowed origins
    const allowedOrigins = [
      'https://hostel-grievance-addresal-4jbz.vercel.app',
      'https://hostel-grievance-addresal.onrender.com',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    if (process.env.NODE_ENV === 'development') {
      // In development, allow any origin
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use("/api", routes);


app.use("/api/issues", issueRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/lost-and-found", lostAndFoundRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;
