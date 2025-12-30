import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { runMigrations } from "../db/migrate"; // ✅ fixed path

const app = express();
const httpServer = createServer(app);

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  try {
    // Run database migrations
    await runMigrations();
    console.log("✅ Migrations completed");

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // File uploads
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      console.log(`Creating uploads directory at: ${uploadsDir}`);
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    app.use("/uploads", express.static(uploadsDir));

    // Register routes
    await registerRoutes(httpServer, app);

    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error(err);
      res.status(status).json({ message });
    });

    // Serve static files in production
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // Start server
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
}

bootstrap();
