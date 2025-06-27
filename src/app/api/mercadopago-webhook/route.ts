// app/api/coinbase-webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { processMercadoPagoWebhookPayment } from "@/actions/payments/process-mercadopago-webhook-payment";

const MercadoPagoWebhookSchema = z.object({
  id: z.string(),
  type: z.enum(["payment"]),
  data: z.object({
    id: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Missing MERCADOPAGO_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const dataID = url.searchParams.get("data.id");

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  if (!xSignature || !xRequestId || !dataID) {
    console.warn(
      " ⚠️ [MercadoPagoWebhook] Missing headers or data ID:",
      url,
      xSignature,
      xRequestId,
      dataID
    );
    return NextResponse.json({ error: "No signature header" }, { status: 400 });
  }

  const parts = xSignature.split(",");
  let ts: string | undefined;
  let hash: string | undefined;
  parts.forEach((part) => {
    // Split each part into key and value
    const [key, value] = part.split("=");
    if (key && value) {
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();
      if (trimmedKey === "ts") {
        ts = trimmedValue;
      } else if (trimmedKey === "v1") {
        hash = trimmedValue;
      }
    }
  });

  const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(manifest);

  // Obtain the hash result as a hexadecimal string
  const sha = hmac.digest("hex");

  const rawBody = await request.text();

  if (sha != hash) {
    console.warn(
      " ⚠️ [MercadoPagoWebhook] Invalid signature:",
      sha,
      "expected:",
      hash
    );
    console.warn(" ⚠️ [MercadoPagoWebhook] Raw Body: ", rawBody);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);

    const result = MercadoPagoWebhookSchema.safeParse(payload);
    try {
      if (result.success && result.data.type === "payment") {
        console.log("[MercadoPagoWebhook] Process Payload", result.data);
        const response = await processMercadoPagoWebhookPayment(result.data.id);
        console.log("[MercadoPagoWebhook] Response: ", response);
      } else {
        console.log("[MercadoPagoWebhook] Raw Payload", payload);
      }
    } catch (err) {
      console.error("❌ [MercadoPagoWebhook] Error processing event", err);
    } finally {
      return NextResponse.json(
        `Received event id=${result.data?.id}, type=${result.data?.type}`,
        { status: 200 }
      );
    }
  } catch (err) {
    console.error("[MercadoPagoWebhook] Invalid JSON payload", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
