const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// Load environment variables from config.env
const envPath = path.join(__dirname, "config.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value && !key.startsWith("#")) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

// Configuration
const INNO_API_URL = process.env.INNO_API_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET || "";

console.log("🚀 Starting Simple Guess Game Cron Service");
console.log(`📡 Will call: ${INNO_API_URL}/api/game/finalize`);
console.log(`⏰ Every: 60 seconds`);
console.log(`🔑 Has CRON_SECRET: ${!!CRON_SECRET}`);

// Cron job function
async function callFinalizeAPI() {
  const timestamp = new Date().toISOString();
  console.log(`🔄 [${timestamp}] Calling finalize API...`);

  try {
    const response = await axios.post(
      `${INNO_API_URL}/api/game/finalize`,
      {},
      {
        headers: {
          "x-cron-secret": CRON_SECRET,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds
      }
    );

    const duration = Date.now() - new Date(timestamp).getTime();

    if (response.data.success) {
      console.log(
        `✅ [${new Date().toISOString()}] Finalization successful (${duration}ms)`
      );
      if (response.data.winner) {
        console.log(
          `🏆 Winner: ${response.data.winner.userId} (Score: ${response.data.winner.score})`
        );
      }
      if (response.data.message) {
        console.log(`📝 Message: ${response.data.message}`);
      }
    } else {
      console.warn(
        `⚠️ [${new Date().toISOString()}] Finalization failed: ${
          response.data.error
        } (${duration}ms)`
      );
    }
  } catch (error) {
    const duration = Date.now() - new Date(timestamp).getTime();
    const currentTime = new Date().toISOString();

    if (error.response) {
      console.error(
        `❌ [${currentTime}] API Error (${error.response.status}): ${
          error.response.data?.error || error.message
        } (${duration}ms)`
      );
    } else if (error.code === "ECONNREFUSED") {
      console.error(
        `❌ [${currentTime}] Connection refused. Is the main API running? (${duration}ms)`
      );
    } else if (error.code === "ENOTFOUND") {
      console.error(
        `❌ [${currentTime}] Host not found: ${INNO_API_URL} (${duration}ms)`
      );
    } else {
      console.error(
        `❌ [${currentTime}] Network error: ${error.message} (${duration}ms)`
      );
    }
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "guess-game-cron-simple",
    config: {
      apiUrl: INNO_API_URL,
      hasCronSecret: !!CRON_SECRET,
      interval: "60 seconds",
    },
  });
});

app.post("/api/health/trigger", async (req, res) => {
  try {
    await callFinalizeAPI();
    res.json({
      success: true,
      message: "Manual trigger completed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Manual trigger failed",
      error: error.message,
    });
  }
});

// Start the cron job
const intervalId = setInterval(callFinalizeAPI, 60 * 1000); // 60 seconds

// Call immediately on start
callFinalizeAPI();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  clearInterval(intervalId);
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  clearInterval(intervalId);
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Simple cron service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `🔧 Manual trigger: POST http://localhost:${PORT}/api/health/trigger`
  );
});
