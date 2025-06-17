"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../user/get-current-user";
import { ActionResponse } from "@/types/action-response";
import {
  user_payments,
  user_payments_schema,
} from "@prisma-zod/generated/zod.schema";

export async function getUserPaymentDataAction(
  paymentId: string
): Promise<ActionResponse<user_payments>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error_message: "error.user_not_authenticated" };
  }
  const payment = await prisma.user_payments.findUnique({
    where: { id: paymentId, user_id: user.id },
  });

  if (!payment) {
    return { success: false, error_message: "error.payment_not_found" };
  }

  return { success: true, data: user_payments_schema.parse(payment) };
}
