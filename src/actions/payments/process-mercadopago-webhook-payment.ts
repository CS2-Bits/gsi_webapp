"use server";

import { prisma } from "@/lib/prisma";
import { payment_status } from "@prisma/client";
import paymentStatusChangedEvent from "../stream/payment-status-changed-event";
import { Payment } from "mercadopago";
import { mercadopagoClient } from "@/lib/mercadopago";

export async function processMercadoPagoWebhookPayment(paymentId: string) {
  const mercadoPagoPayment = new Payment(mercadopagoClient);
  const mpPayment = await mercadoPagoPayment.get({ id: paymentId });

  if (!mpPayment.id) {
    throw new Error(`Payment id not found for payment: ${paymentId}`);
  }

  const payment = await prisma.user_payments.findFirst({
    where: { provider_transaction_id: mpPayment.id.toString() },
  });

  if (!payment) {
    throw new Error(`Payment id: ${mpPayment.id} not found`);
  }

  let newStatus: payment_status | null = null;

  switch (mpPayment.status) {
    case "approved":
      newStatus = "Completed";
      break;
    case "cancelled":
    case "rejected":
      newStatus = "Failed";
      break;
    case "refunded":
    case "charged_back":
      newStatus = "Refunded";
      break;
    default:
      newStatus = null;
  }

  if (!newStatus) {
    return {
      payment_status: payment.status,
      payment_id: payment.id,
      message: "payment.ignored_event",
    };
  }

  if (
    payment.status === newStatus ||
    (payment.status === "Canceled" && newStatus === "Completed")
  ) {
    return {
      payment_status: payment.status,
      payment_id: payment.id,
      message: "payment.already_processed",
    };
  }

  await paymentStatusChangedEvent({
    payment_id: payment.id,
    new_status: newStatus,
  });

  const msg =
    newStatus === "Completed"
      ? "payment.processing_description"
      : newStatus === "Failed"
        ? "payment.failed_description"
        : "payment.refunded_description";

  return {
    payment_status: newStatus === "Completed" ? "Processing" : newStatus,
    payment_id: payment.id,
    message: msg,
  };
}
