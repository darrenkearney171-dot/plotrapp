import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
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

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Capture raw body for Stripe webhook signature verification BEFORE json middleware
  app.use((req, _res, next) => {
    if (req.path === "/api/stripe/webhook") {
      let data = Buffer.alloc(0);
      req.on("data", (chunk: Buffer) => { data = Buffer.concat([data, chunk]); });
      req.on("end", () => { (req as any).rawBody = data; next(); });
    } else {
      next();
    }
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // File upload endpoint (raw multipart, must be before json middleware catches it)
  // Rate-limited: 20 uploads per minute per IP
  app.use("/api/upload", uploadRateLimit);
  registerUploadRoute(app);
  // Stripe webhook (must be registered after raw body capture)
  registerStripeWebhook(app);

  // tRPC API — rate-limited: 100 requests per minute per IP
  app.use("/api/trpc", apiRateLimit);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

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
