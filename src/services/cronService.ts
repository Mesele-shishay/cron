import axios, { AxiosResponse } from "axios";

interface FinalizeResponse {
  success: boolean;
  message?: string;
  error?: string;
  winner?: {
    ticketId: string;
    userId: string;
    score: number;
  };
  order?: number[];
}

export class CronService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly API_URL: string;
  private readonly CRON_SECRET: string;
  private readonly INTERVAL_MS = 60 * 1000; // 1 minute

  constructor() {
    this.API_URL = process.env.INNO_API_URL || "http://localhost:3000";
    this.CRON_SECRET = process.env.CRON_SECRET || "";

    if (!this.CRON_SECRET) {
      console.warn("⚠️  CRON_SECRET not set. API calls may fail.");
    }
  }

  start(): void {
    console.log("🕐 Starting cron service...");
    console.log(`📡 Will call: ${this.API_URL}/api/game/finalize`);
    console.log(`⏰ Every: ${this.INTERVAL_MS / 1000} seconds`);

    // Call immediately on start
    this.callFinalizeAPI();

    // Then set up the interval
    this.intervalId = setInterval(() => {
      this.callFinalizeAPI();
    }, this.INTERVAL_MS);
  }

  stop(): void {
    console.log("🛑 Stopping cron service...");
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async callFinalizeAPI(): Promise<void> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      console.log(`🔄 [${timestamp}] Calling finalize API...`);

      const response: AxiosResponse<FinalizeResponse> = await axios.post(
        `${this.API_URL}/api/game/finalize`,
        {},
        {
          headers: {
            "x-cron-secret": this.CRON_SECRET,
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      const duration = Date.now() - startTime;

      if (response.data.success) {
        console.log(
          `✅ [${timestamp}] Finalization successful (${duration}ms)`
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
          `⚠️  [${timestamp}] Finalization failed: ${response.data.error} (${duration}ms)`
        );
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;

      if (error.response) {
        // Server responded with error status
        console.error(
          `❌ [${timestamp}] API Error (${error.response.status}): ${
            error.response.data?.error || error.message
          } (${duration}ms)`
        );
      } else if (error.code === "ECONNREFUSED") {
        console.error(
          `❌ [${timestamp}] Connection refused. Is the main API running? (${duration}ms)`
        );
      } else if (error.code === "ENOTFOUND") {
        console.error(
          `❌ [${timestamp}] Host not found: ${this.API_URL} (${duration}ms)`
        );
      } else {
        console.error(
          `❌ [${timestamp}] Network error: ${error.message} (${duration}ms)`
        );
      }
    }
  }

  // Method to manually trigger finalization
  async triggerManual(): Promise<FinalizeResponse | null> {
    try {
      console.log("🔄 Manual trigger: Calling finalize API...");

      const response: AxiosResponse<FinalizeResponse> = await axios.post(
        `${this.API_URL}/api/game/finalize`,
        {},
        {
          headers: {
            "x-cron-secret": this.CRON_SECRET,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ Manual trigger completed");
      return response.data;
    } catch (error: any) {
      console.error(`❌ Manual trigger failed: ${error.message}`);
      return null;
    }
  }
}
