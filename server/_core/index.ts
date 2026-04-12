import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createConnection } from "mysql2/promise";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerUploadRoute } from "../uploadRoute";
import { registerStripeWebhook } from "../stripeWebhook";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { apiRateLimit, uploadRateLimit } from "../rateLimit";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function runStartupMigrations() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("[DB] No DATABASE_URL — skipping startup migrations");
    return;
  }
  try {
    const conn = await createConnection(dbUrl);
    const migrationsDir = join(process.cwd(), "drizzle");
    const files = readdirSync(migrationsDir)
      .filter(f => /^\d+_.*\.sql$/.test(f))
      .sort();

    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), "utf8");
      const statements = sql.split("--> statement-breakpoint").map(s => s.trim()).filter(Boolean);
      for (const stmt of statements) {
        try {
          await conn.execute(stmt);
        } catch (e: any) {
          // Ignore "already exists" errors — table/index/column already present
          if (e.errno !== 1050 && e.errno !== 1060 && e.errno !== 1061 && e.errno !== 1068) {
            console.warn(`[DB] Migration warning (${file}):`, e.message);
          }
        }
      }
    }
    await conn.end();
    console.log(`[DB] Startup migrations complete (${files.length} files processed)`);
  } catch (err) {
    console.error("[DB] Startup migration failed:", err);
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use((req, _res, next) => {
    if (req.path === "/api/stripe/webhook") {
      let data = Buffer.alloc(0);
      req.on("data", (chunk: Buffer) => { data = Buffer.concat([data, chunk]); });
      req.on("end", () => { (req as any).rawBody = data; next(); });
    } else {
      next();
    }
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);
  app.use("/api/upload", uploadRateLimit);
  registerUploadRoute(app);
  registerStripeWebhook(app);

  app.use("/api/trpc", apiRateLimit);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  await runStartupMigrations();

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
