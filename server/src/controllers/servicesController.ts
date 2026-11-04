import type { Request, Response } from "express";
import { db } from "../db/client.ts";
import { sendOk } from "../lib/http.ts";

export async function getServices(_req: Request, res: Response): Promise<void> {
  const categories = await db.listCategories();
  sendOk(
    res,
    {
      pickupNote: "Pickup available at a fee.",
      dropOff: {
        address: "7375 Sibiya Street, Daveyton",
        whatsapp: "060 680 0678",
        whatsappE164: "+27606800678",
      },
      categories,
    },
    "Service catalogue",
  );
}
