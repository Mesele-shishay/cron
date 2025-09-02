import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { CronService } from "./services/cronService";
import { healthRouter } from "./routes/health";

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

// Routes
app.use("/api/health", healthRouter);

// Initialize cron service
const cronService = new CronService();
cronService.start();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  cronService.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  cronService.stop();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Cron service running on port ${PORT}`);
  console.log(`📅 Finalize API will be called every minute`);
});
