"use server";

import { prisma } from "@/lib/prisma";
import { processMercadoPagoPayment } from "./process-user-payment-success-action";
import paymentStatusChangedEvent from "../stream/payment-status-changed-event";

export async function processMercadoPagoWebhookPayment(paymentId: string) {
  const payment = await prisma.user_payments.findFirst({
    where: { provider_transaction_id: paymentId },
  });

  if (!payment) {
    throw new Error(`Payment id: ${paymentId} not found`);
  }

  const paymentStatus = await processMercadoPagoPayment(paymentId);

  if (payment.status != paymentStatus) {
    await paymentStatusChangedEvent({
      payment_id: payment.id,
      new_status: paymentStatus,
    });
  }

  const msg =
    paymentStatus === "Completed"
      ? "payment.processing_description"
      : paymentStatus === "Failed"
        ? "payment.failed_description"
        : "payment.refunded_description";

  return {
    payment_status: paymentStatus,
    payment_id: payment.id,
    message: msg,
  };
}
