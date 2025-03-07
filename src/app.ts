import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import http from "http";
import routes from "./routes";
import { connectDatabase } from "./config/database";
import { errorMiddleware } from "./middleware/error.middleware";
import { setupSocketIO } from "./socket";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Set up Socket.IO
setupSocketIO(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - All API routes are mounted under /api prefix
app.use('/api', routes);

// Error handling middleware - Catches all errors thrown in routes
app.use(errorMiddleware);

// Connect to database and start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDatabase();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default server;