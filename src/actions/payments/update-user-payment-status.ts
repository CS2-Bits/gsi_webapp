"use server";

import paymentStatusChangedEvent from "../stream/payment-status-changed-event";
import {
  UpdatePaymentStatus,
  UpdatePaymentStatusSchema,
} from "@/schemas/handle-payment.schema";
import { ActionError } from "@/types/action-error";
import { prisma } from "@/lib/prisma";

export async function updateUserPaymentStatus({
  paymentId,
  paymentStatus,
}: UpdatePaymentStatus): Promise<boolean> {
  try {
    const data = UpdatePaymentStatusSchema.parse({
      paymentId,
      paymentStatus,
    });

    const payment = await prisma.user_payments.count({
      where: {
        id: data.paymentId,
      },
    });

    if (payment === 0) {
      console.error(`Payment with ID ${data.paymentId} not found.`);
      throw new ActionError("error.payment_not_found");
    }

    await paymentStatusChangedEvent({
      payment_id: data.paymentId,
      new_status: paymentStatus,
    });

    return true;
  } catch (error) {
    console.error(`Error updating payment status to ${paymentStatus}:`, error);
    if (error instanceof ActionError) {
      throw error;
    }
    throw new ActionError("error.update_payment_status_failed");
  }
}
