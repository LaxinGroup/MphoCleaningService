import type { Response } from "express";
import type { ApiFailure, ApiSuccess } from "../types.ts";

export function sendOk<T>(
  res: Response,
  data: T,
  message = "OK",
  status = 200,
): Response {
  const body: ApiSuccess<T> = { success: true, message, data };
  return res.status(status).json(body);
}

export function sendFail(
  res: Response,
  status: number,
  message: string,
): Response {
  const body: ApiFailure = { success: false, message, data: null };
  return res.status(status).json(body);
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}
