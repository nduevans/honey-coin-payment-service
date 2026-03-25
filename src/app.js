import "dotenv/config";
import express from "express";
import { initializeDatabase } from "./db/database.js";
import chargesRouter from "./routes/charges.js";
import webhooksRouter from "./routes/webhooks.js";

const PORT = process.env.PORT || 3000;
console.log(`[app] Starting with config:`, { PORT });

const app = express();
app.use(express.json());

try {
  initializeDatabase();
  console.log("[app] SQLITE database connected successfully");
} catch (error) {
  console.error("[app] SQLITE database startup failed");
  console.error(error);
  process.exit(1);
}

// --- Routes ---
app.use("/charge", chargesRouter);
app.use("/charges", chargesRouter);
app.use("/webhooks", webhooksRouter);

app.listen(PORT, () => {
  console.log(`[app] listening on port ${PORT}`);
});
