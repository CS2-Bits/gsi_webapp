"use server";

import { currency, payment_provider, payment_status } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action-response";
import {
  CreatePayment,
  CreatePaymentResponse,
  CreatePaymentSchema,
} from "@/schemas/handle-payment.schema";
import { createCoinbasePayment } from "./create-coinbase-payment";
import { createStripePayment } from "./create-stripe-payment";
import { createMercadoPagoPayment } from "./create-mercadopago-payment";
import { getCurrentUser } from "../user/get-current-user";

export default async function createPaymentAction(
  data: CreatePayment
): Promise<ActionResponse<CreatePaymentResponse>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error_message: "error.user_not_authenticated",
      };
    }
    const dataParsed = CreatePaymentSchema.parse(data);
    const point_package = await prisma.point_packages.findUnique({
      where: {
        id: dataParsed.packageId,
        active: true,
      },
    });

    if (!point_package) {
      return {
        success: false,
        error_message: "error.point_package_not_found",
      };
    }

    if (point_package.limit_per_user && point_package.limit_per_user > 0) {
      const userPaymentCount = await prisma.user_payments.count({
        where: {
          user_id: user.id,
          package_id: point_package.id,
          AND: [
            {
              status: {
                not: payment_status.Canceled,
              },
            },
            {
              status: {
                not: payment_status.Failed,
              },
            },
          ],
        },
      });
      if (userPaymentCount >= point_package.limit_per_user) {
        return {
          success: false,
          error_message: "error.point_package_limit_reached",
        };
      }
    }

    if (
      point_package.currency === currency.USDC &&
      dataParsed.provider !== payment_provider.Coinbase
    ) {
      return {
        success: false,
        error_message: "error.payment_creation_failed",
      };
    }

    if (
      point_package.currency === currency.BRL &&
      dataParsed.provider !== payment_provider.MercadoPago &&
      dataParsed.provider !== payment_provider.Stripe
    ) {
      return {
        success: false,
        error_message: "error.payment_creation_failed",
      };
    }

    let result: CreatePaymentResponse | null = null;
    switch (dataParsed.provider) {
      case payment_provider.Stripe:
        result = await createStripePayment(user, dataParsed);
        break;
      case payment_provider.Coinbase:
        result = await createCoinbasePayment(user, dataParsed);
        break;
      case payment_provider.MercadoPago:
        result = await createMercadoPagoPayment(user, dataParsed);
        break;
      default:
        return {
          success: false,
          error_message: "error.payment_creation_failed",
        };
    }
    if (!result) {
      return {
        success: false,
        error_message: "error.payment_creation_failed",
      };
    }
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error creating payment:", error);
    return {
      success: false,
      error_message: "error.payment_creation_failed",
    };
  }
}
