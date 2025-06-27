"use server";

import { prisma } from "@/lib/prisma";
import { createDefaultPayment } from "./create-default-payment";
import {
  CreatePayment,
  CreatePaymentResponse,
} from "@/schemas/handle-payment.schema";
import { ActionError } from "@/types/action-error";
import { updateUserPaymentStatus } from "./update-user-payment-status";
import { payment_provider } from "@prisma/client";
import { users } from "@prisma-zod/generated/zod.schema";
import { Payment } from "mercadopago";
import { mercadopagoClient } from "@/lib/mercadopago";

export async function createMercadoPagoPayment(
  user: users,
  data: CreatePayment
): Promise<CreatePaymentResponse> {
  const { payment, pointPackage } = await createDefaultPayment(user, data);
  try {
    // Map currency codes to MercadoPago currency codes
    if (pointPackage.currency !== "BRL") {
      throw new Error("Only BRL payments are supported with MercadoPago");
    }

    const mercadoPagoPayment = new Payment(mercadopagoClient);

    const response = await mercadoPagoPayment.create({
      body: {
        transaction_amount: pointPackage.price.toNumber(),
        description: pointPackage.name,
        date_of_expiration: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        payment_method_id: "pix",
        payer: {
          email: user.email!,
        },
      },
      requestOptions: { idempotencyKey: payment.id },
    });

    if (!response.id) {
      await updateUserPaymentStatus({
        paymentId: payment.id,
        paymentStatus: "Failed",
      });
      throw new ActionError("error.mercadopago_preference_creation_failed");
    }

    await prisma.user_payments.update({
      where: {
        id: payment.id,
      },
      data: {
        provider_transaction_id: response.id.toString(),
      },
    });

    return {
      provider: payment_provider.MercadoPago,
      clientSecret: response.id.toString(),
      paymentId: payment.id,
    };
  } catch (error) {
    console.error("Error creating MercadoPago payment:", error);
    await updateUserPaymentStatus({
      paymentId: payment.id,
      paymentStatus: "Failed",
    });
    if (error instanceof ActionError) {
      throw error;
    }
    throw new ActionError("error.payment_creation_failed");
  }
}
