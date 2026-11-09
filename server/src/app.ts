import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { sendOk } from "./lib/http.ts";
import { api } from "./routes/index.ts";

export const app = express();

app.use(helmet());

const allowedOrigins = (env.clientOrigin || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Next.js server-side rewrites, curl, mobile)
      if (!origin) return callback(null, true);

      // Allow localhost for local development
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return callback(null, true);
      }

      // Allow any Vercel production or preview domain
      if (origin.endsWith(".vercel.app") || origin.includes("vercel.app")) {
        return callback(null, true);
      }

      // Allow explicitly configured origins
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => {
  sendOk(res, { ok: true, service: "mupho-api" });
});

app.get("/", (_req, res) => {
  sendOk(res, { ok: true, service: "mupho-api" }, "Server is running perfectly");
});

app.use("/api", api);

app.use(errorHandler);
