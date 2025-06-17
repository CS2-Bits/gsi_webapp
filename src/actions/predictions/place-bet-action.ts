"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PlaceBetInput, PlaceBetSchema } from "@/schemas/prediction.schema";
import { redis } from "@/lib/redis";
import { getCurrentUser } from "../user/get-current-user";
import { ActionResponse } from "@/types/action-response";
import { getUserBalance } from "../user/get-user-balance";
import { ActionError } from "@/types/action-error";

export async function placeBetAction(
  data: PlaceBetInput
): Promise<ActionResponse<boolean>> {
  try {
    const validatedFields = PlaceBetSchema.parse(data);

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error_message: "error.user_not_authenticated",
      };
    }

    const userBalance = await getUserBalance();

    if (!userBalance) {
      return {
        success: false,
        error_message: "error.user_balance_not_found",
      };
    }

    if (userBalance.balance < validatedFields.amount) {
      return {
        success: false,
        error_message: "error.insufficient_balance",
      };
    }

    const prediction = await prisma.predictions.findUnique({
      where: {
        id: validatedFields.predictionId,
        state: "Open",
      },
      include: {
        prediction_templates: true,
        stream_matches: true,
      },
    });

    if (!prediction) {
      return {
        success: false,
        error_message: "error.prediction_not_found",
      };
    }

    if (
      Number(prediction.prediction_templates.min_bet_amount) >
      validatedFields.amount
    ) {
      return {
        success: false,
        error_message: "error.bet_amount_too_low",
      };
    }

    if (
      validatedFields.amount >
      Number(prediction.prediction_templates.max_bet_amount)
    ) {
      return {
        success: false,
        error_message: "error.bet_amount_too_high",
      };
    }

    // Start a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Create the user prediction
      const userPrediction = await tx.user_predictions.create({
        data: {
          user_id: currentUser.id,
          prediction_id: prediction.id,
          option_label: validatedFields.optionLabel,
          amount: validatedFields.amount,
        },
      });

      // Update user balance
      await tx.user_balances.update({
        where: {
          user_id: currentUser.id,
        },
        data: {
          balance: {
            decrement: validatedFields.amount,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.user_transactions.create({
        data: {
          user_id: currentUser.id,
          amount: -validatedFields.amount,
          description: `Bet on prediction ${prediction.prediction_templates.kind}`,
          type: "Predict",
        },
      });

      // Create user prediction transaction relationship
      await tx.user_prediction_transactions.create({
        data: {
          user_transaction_id: transaction.id,
          user_prediction_id: userPrediction.id,
        },
      });

      // Create user balance transaction relationship
      await tx.user_balance_transactions.create({
        data: {
          user_transaction_id: transaction.id,
          user_balance_id: currentUser.id,
        },
      });
    });

    await redis.publish(
      "match_events:" + prediction.stream_matches.streamer_id + ":bet",
      prediction.id
    );

    // Revalidate paths to update UI
    revalidatePath("/[streamer]");
    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("Error placing bet:", error);
    if (error instanceof ActionError) {
      return {
        success: false,
        error_message: error.message,
      };
    }
    return {
      success: false,
      error_message: "error.unexpected_error",
    };
  }
}
