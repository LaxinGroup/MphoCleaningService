import type { ErrorRequestHandler } from "express";
import { HttpError, sendFail } from "../lib/http.ts";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    sendFail(res, err.status, err.message);
    return;
  }

  const message =
    err instanceof Error ? err.message : "An unexpected error occurred.";
  console.error("[mupho]", err);
  sendFail(res, 500, message);
};
