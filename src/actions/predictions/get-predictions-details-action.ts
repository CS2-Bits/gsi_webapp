"use server";

import { prisma } from "@/lib/prisma";
import {
  PredictionDetail,
  PredictionDetailSchema,
} from "@/schemas/prediction.schema";
import { ActionResponse } from "@/types/action-response";
import { getCurrentUser } from "../user/get-current-user";
import { ActionError } from "@/types/action-error";
import { user_predictions } from "@prisma/client";

export async function getPredictionsDetailsAction(
  predictionId: string
): Promise<ActionResponse<PredictionDetail>> {
  try {
    // Get predictions for the match with their templates and options
    const prediction = await prisma.predictions.findUnique({
      where: {
        id: predictionId,
      },
      include: {
        prediction_templates: {
          include: {
            prediction_options: true,
          },
        },
        user_predictions: true,
      },
    });

    if (!prediction) {
      return {
        success: false,
        error_message: "error.prediction_not_found",
      };
    }

    // Get current user
    const currentUser = await getCurrentUser();

    // Process predictions with or without user data
    let userPredictions: user_predictions[] = [];
    if (currentUser) {
      userPredictions = await prisma.user_predictions.findMany({
        where: {
          prediction_id: prediction.id,
          user_id: currentUser.id,
        },
      });
    }

    // Get options from the template
    const options = prediction.prediction_templates.prediction_options || [];
    const allBets = prediction.user_predictions || [];

    // Calculate totals
    const totalBets = allBets.length;
    const totalAmount = allBets.reduce(
      (sum, bet) => sum + Number(bet.amount),
      0
    );

    // Calculate per option
    const optionsWithStats = options.map((option) => {
      const optionBets = allBets.filter(
        (bet) => bet.option_label === option.label
      );
      const optionAmount = optionBets.reduce(
        (sum, bet) => sum + Number(bet.amount),
        0
      );
      const optionBetCount = optionBets.length;
      const percentage =
        totalAmount > 0 ? (optionAmount / totalAmount) * 100 : 0;

      // Calculate odds (1:X format)
      const odds =
        totalAmount > 0 && optionAmount > 0
          ? (totalAmount - optionAmount) / optionAmount
          : 0;

      // User's bets on this option
      const userBetsOnOption = userPredictions
        .filter((bet) => bet.option_label === option.label)
        .reduce((sum, bet) => sum + Number(bet.amount), 0);

      return {
        ...option,
        betCount: optionBetCount,
        amount: optionAmount,
        percentage,
        odds,
        userAmount: userBetsOnOption,
      };
    });

    // User's total bets on this prediction
    const userTotalBets = userPredictions.reduce(
      (sum, bet) => sum + Number(bet.amount),
      0
    );
    const predictionDetail = {
      totalBets,
      totalAmount,
      options: optionsWithStats,
      userTotalBets,
      user_bets: userPredictions,
    };

    return {
      success: true,
      data: PredictionDetailSchema.parse(predictionDetail),
    };
  } catch (error) {
    console.error("Error fetching predictions:", error);
    if (error instanceof ActionError) {
      return {
        success: false,
        error_message: error.message,
      };
    }
    return {
      success: false,
      error_message: "error.fetch_failed",
    };
  }
}
