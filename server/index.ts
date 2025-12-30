import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";

import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { runMigrations } from "./db/migrate";

const app = express();
const httpServer = createServer(app);

const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- FILE UPLOAD SETUP ---
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory at: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// ---- BOOTSTRAP ----
async function bootstrap() {
  try {
    // 1️⃣ Run DB migrations
    await runMigrations();

    // 2️⃣ Register API routes
    await registerRoutes(httpServer, app);

    // 3️⃣ Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error(err);
      res.status(status).json({ message });
    });

    // 4️⃣ Frontend handling
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // 5️⃣ Start server (ONLY ONCE)
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
}

bootstrap();
