"use server";

import { prisma } from "@/lib/prisma";
import { createDefaultPayment } from "./create-default-payment";
import { CoinbaseTimelineStatusSchema } from "@/schemas/coinbase-payment-status.schema";
import {
  CreatePayment,
  CreatePaymentResponse,
} from "@/schemas/handle-payment.schema";
import { ActionError } from "@/types/action-error";
import { updateUserPaymentStatus } from "./update-user-payment-status";
import { payment_provider } from "@prisma/client";
import { users } from "@prisma-zod/generated/zod.schema";

export async function createCoinbasePayment(
  user: users,
  data: CreatePayment
): Promise<CreatePaymentResponse> {
  try {
    const { payment, pointPackage } = await createDefaultPayment(user, data);

    const coinbaseResponse = await fetch(
      "https://api.commerce.coinbase.com/charges",
      {
        method: "POST",
        body: JSON.stringify({
          buyer_locale: pointPackage.currency,
          local_price: {
            amount:
              process.env.NODE_ENV === "development"
                ? "1"
                : pointPackage.price.toString(),
            currency:
              process.env.NODE_ENV === "development"
                ? "BRL"
                : pointPackage.currency,
          },
          pricing_type: "fixed_price",
          cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancel?payment_id=${payment.id}`,
          redirect_url: `${process.env.NEXTAUTH_URL}/payment/success?payment_id=${payment.id}`,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CC-Version": "2018-03-22",
          "X-CC-Api-Key": process.env.COINBASE_API_KEY!,
        },
      }
    );
    if (!coinbaseResponse.ok) {
      console.error(
        "Failed to create Coinbase payment",
        await coinbaseResponse.json()
      );
      await updateUserPaymentStatus({
        paymentId: payment.id,
        paymentStatus: "Failed",
      });
      throw new ActionError("error.payment_creation_failed");
    }
    const coinbaseData = await coinbaseResponse.json();
    const coinBasePaymentStatus = CoinbaseTimelineStatusSchema.safeParse(
      coinbaseData.data
    );

    if (!coinBasePaymentStatus.success) {
      await updateUserPaymentStatus({
        paymentId: payment.id,
        paymentStatus: "Failed",
      });
      throw new ActionError("error.invalid_coinbase_response");
    }

    // Update payment with provider transaction ID
    await prisma.user_payments.update({
      where: {
        id: payment.id,
      },
      data: {
        provider_transaction_id: coinBasePaymentStatus.data.id,
      },
    });

    return {
      url: coinBasePaymentStatus.data.hosted_url,
      provider: payment_provider.Coinbase,
      paymentId: payment.id,
    };
  } catch (error) {
    console.error("Error creating Coinbase payment:", error);
    if (error instanceof ActionError) {
      throw error;
    }
    throw new ActionError("error.payment_creation_failed");
  }
}
