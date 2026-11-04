import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { sendOk } from "./lib/http.ts";
import { api } from "./routes/index.ts";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    methods: ["GET", "POST", "OPTIONS"],
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
