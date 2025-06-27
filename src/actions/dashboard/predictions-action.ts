"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action-response";
import {
  bet_state,
  prediction_templates,
  prediction_templates_schema,
  predictions,
  predictions_schema,
} from "@prisma-zod/generated/zod.schema";
import predictionsStateChangedEvent from "../stream/predictions-state-changed-event";
import { getUserAdmin } from "./get-user-admin";

export async function getPredictionsAction(filters?: {
  startDate?: string;
  endDate?: string;
  status?: bet_state;
}): Promise<
  ActionResponse<
    {
      predictions: predictions;
      prediction_templates: prediction_templates;
    }[]
  >
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }
  const predictions = await prisma.predictions.findMany({
    where: {
      created_at: {
        gte: filters?.startDate ? new Date(filters.startDate) : undefined,
        lte: filters?.endDate ? new Date(filters.endDate) : undefined,
      },
      state: filters?.status ? { equals: filters.status } : undefined,
    },
    include: {
      prediction_templates: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  const parsedPredictions = predictions.map((p) => {
    return {
      predictions: predictions_schema.parse(p),
      prediction_templates: prediction_templates_schema.parse(
        p.prediction_templates
      ),
    };
  });

  return {
    success: true,
    data: parsedPredictions,
  };
}

export async function updatePredictionStatusAction(
  predictionId: string,
  new_status: bet_state
): Promise<
  ActionResponse<{
    predictions: predictions;
    prediction_templates: prediction_templates;
  }>
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }
  const prediction = await prisma.predictions.findUnique({
    where: { id: predictionId },
    include: { prediction_templates: true, stream_matches: true },
  });

  if (!prediction) {
    return {
      success: false,
      error_message: "error.prediction_not_found",
    };
  }

  const res = await predictionsStateChangedEvent(
    prediction.id,
    prediction.stream_matches.streamer_id,
    new_status
  );

  if (!res) {
    return {
      success: false,
      error_message: "error.internal_error",
    };
  }

  return {
    success: true,
    data: {
      predictions: predictions_schema.parse(prediction),
      prediction_templates: prediction_templates_schema.parse(
        prediction.prediction_templates
      ),
    },
  };
}
