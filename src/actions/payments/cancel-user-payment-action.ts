"use server";
import { ActionResponse } from "@/types/action-response";
import { updateUserPaymentStatus } from "./update-user-payment-status";
import { ActionError } from "@/types/action-error";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "../user/get-current-user";
import { prisma } from "@/lib/prisma";
import { payment_provider } from "@prisma/client";
import { Payment } from "mercadopago";
import { mercadopagoClient } from "@/lib/mercadopago";

export default async function cancelUserPaymentAction(
  paymentId: string
): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new ActionError("error.user_not_authenticated");
    }
    const payment = await prisma.user_payments.findUnique({
      where: {
        id: paymentId,
        user_id: user.id,
      },
    });
    if (!payment) {
      return {
        success: false,
        error_message: "error.payment_not_found",
      };
    }
    const res = await updateUserPaymentStatus({
      paymentId: payment.id,
      paymentStatus: "Canceled",
    });
    console.log(`Cancelling payment with ID: ${paymentId}`);
    if (!res) {
      return {
        success: false,
        error_message: "error.payment_not_found",
      };
    }
    if (!payment.provider_transaction_id) {
      return {
        success: false,
        error_message: "error.internal_error",
      };
    }
    switch (payment.provider) {
      case payment_provider.Stripe:
        await cancelUserPaymentStripe(payment.provider_transaction_id);
        break;
      case payment_provider.MercadoPago:
        await cancelUserPaymentMercadoPago(payment.provider_transaction_id);
        break;
      default:
        throw new ActionError("error.payment_provider_not_supported");
    }
    console.log(`Payment with ID: ${paymentId} cancelled successfully.`);
    return { success: true, data: true };
  } catch (error) {
    console.error("Error cancelling payment:", error);
    if (error instanceof ActionError) {
      return {
        success: false,
        error_message: error.message,
      };
    }
    return {
      success: false,
      error_message: "error.internal_error",
    };
  }
}

async function cancelUserPaymentStripe(paymentId: string) {
  const session = await stripe.paymentIntents.retrieve(paymentId);
  if (!session) {
    return {
      success: false,
      error_message: "error.payment_not_found",
    };
  }
  if (session.status === "processing") {
    const stripe_res = await stripe.paymentIntents.cancel(paymentId);
    if (!stripe_res) {
      return {
        success: false,
        error_message: "error.internal_error",
      };
    }
  }
}

async function cancelUserPaymentMercadoPago(paymentId: string) {
  const mercadoPagoPayment = new Payment(mercadopagoClient);
  const payment = await mercadoPagoPayment.cancel({ id: paymentId });
  if (!payment) {
    return {
      success: false,
      error_message: "error.payment_not_found",
    };
  }
  if (payment.status === "processing") {
    const stripe_res = await stripe.paymentIntents.cancel(paymentId);
    if (!stripe_res) {
      return {
        success: false,
        error_message: "error.internal_error",
      };
    }
  }
}
