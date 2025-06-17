"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { createDefaultPayment } from "./create-default-payment";
import {
  CreatePayment,
  CreatePaymentResponse,
} from "@/schemas/handle-payment.schema";
import { ActionError } from "@/types/action-error";
import { updateUserPaymentStatus } from "./update-user-payment-status";
import { payment_provider } from "@prisma/client";
import { users } from "@prisma-zod/generated/zod.schema";

export async function createStripePayment(
  user: users,
  data: CreatePayment
): Promise<CreatePaymentResponse> {
  try {
    const { payment, pointPackage } = await createDefaultPayment(user, data);
    // Map currency codes to Stripe currency codes
    if (pointPackage.currency === "USDC") {
      throw new Error("USDC payments are not supported with Stripe");
    }
    const stripeCurrency = pointPackage.currency.toLowerCase();

    // Create Stripe checkout session
    const session = await stripe.paymentIntents.create({
      amount: pointPackage.price.mul(100).toNumber(),
      currency: stripeCurrency,
      metadata: {
        payment_id: payment.id,
        user_id: user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    if (!session.client_secret) {
      await updateUserPaymentStatus({
        paymentId: payment.id,
        paymentStatus: "Failed",
      });
      throw new ActionError("error.stripe_session_creation_failed");
    }
    await prisma.user_payments.update({
      where: {
        id: payment.id,
      },
      data: {
        provider_transaction_id: session.id,
      },
    });

    return {
      provider: payment_provider.Stripe,
      clientSecret: session.client_secret ?? undefined,
      paymentId: payment.id,
    };
  } catch (error) {
    console.error("Error creating Stripe payment:", error);
    if (error instanceof ActionError) {
      throw error;
    }
    throw new ActionError("error.payment_creation_failed");
  }
}
