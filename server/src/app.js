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
  origin: ['https://hostel-grievance-addresal.onrender.com', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

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
