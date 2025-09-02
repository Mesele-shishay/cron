import { Router } from "express";
import { CronService } from "../services/cronService";

const router = Router();
const cronService = new CronService();

// Basic health check
router.get("/", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "guess-game-cron",
    version: "1.0.0",
  });
});

// Detailed health check
router.get("/detailed", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "guess-game-cron",
    version: "1.0.0",
    config: {
      apiUrl: process.env.INNO_API_URL || "http://localhost:3000",
      hasCronSecret: !!process.env.CRON_SECRET,
      interval: "60 seconds",
    },
    uptime: process.uptime(),
  });
});

// Manual trigger endpoint
router.post("/trigger", async (req, res) => {
  try {
    const result = await cronService.triggerManual();

    if (result) {
      res.json({
        success: true,
        message: "Manual trigger completed",
        result,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Manual trigger failed",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Manual trigger error",
      error: error.message,
    });
  }
});

export { router as healthRouter };
