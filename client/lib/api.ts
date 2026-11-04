import type { ApiResponse, AvailabilityResult, ServicesPayload } from "./types";

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success || body.data === null) {
    throw new Error(body.message || "Request failed.");
  }
  return body;
}

export async function fetchServices(): Promise<ServicesPayload> {
  const response = await fetch("/api/services", { cache: "no-store" });
  const body = await readJson<ServicesPayload>(response);
  return body.data as ServicesPayload;
}

export async function checkAvailability(
  date: string,
): Promise<AvailabilityResult> {
  const response = await fetch("/api/check-availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date }),
  });
  const body = await readJson<AvailabilityResult>(response);
  return body.data as AvailabilityResult;
}

export async function createBooking(payload: {
  serviceId: number;
  date: string;
  slotId: "morning" | "midday" | "afternoon";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address?: string;
  notes?: string;
}): Promise<void> {
  const response = await fetch("/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await readJson(response);
}
