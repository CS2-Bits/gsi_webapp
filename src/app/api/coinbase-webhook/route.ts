// app/api/coinbase-webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { CoinbaseTimelineStatusSchema } from "@/schemas/coinbase-payment-status.schema";
import { processCoinbaseWebhookPayment } from "@/actions/payments/process-coinbase-webhook-payment";

const CoinbaseWebhookSchema = z.object({
  id: z.string(),
  event: z.object({
    type: z.enum([
      "charge:created",
      "charge:pending",
      "charge:confirmed",
      "charge:failed",
    ]),
    data: CoinbaseTimelineStatusSchema,
  }),
});

export async function POST(request: NextRequest) {
  const secret = process.env.COINBASE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Missing COINBASE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("X-CC-WEBHOOK-SIGNATURE");
  if (!signature) {
    return NextResponse.json({ error: "No signature header" }, { status: 400 });
  }

  const rawBody = await request.text();

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) {
    console.warn(
      " ⚠️ [CoinbaseWebhook] Invalid signature:",
      signature,
      "expected:",
      expected
    );
    console.warn(" ⚠️ [CoinbaseWebhook] Raw Body: ", rawBody);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);

    const result = CoinbaseWebhookSchema.safeParse(payload);
    try {
      if (result.success && result.data.event.type !== "charge:created") {
        console.log(
          "[CoinbaseWebhook] Process Payload",
          result.data,
          result.data.event.data
        );
        const response = await processCoinbaseWebhookPayment(
          result.data.event.data
        );
        console.log("[CoinbaseWebhook] Response: ", response);
      } else {
        console.log("[CoinbaseWebhook] Raw Payload", payload);
      }
    } catch (err) {
      console.error("❌ [CoinbaseWebhook] Error processing event", err);
    } finally {
      return NextResponse.json(
        `Received event id=${result.data?.id}, type=${result.data?.event.type}`,
        { status: 200 }
      );
    }
  } catch (err) {
    console.error("[CoinbaseWebhook] Invalid JSON payload", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
