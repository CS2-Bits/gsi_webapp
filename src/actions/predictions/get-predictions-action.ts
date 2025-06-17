"use server";

import { prisma } from "@/lib/prisma";
import {
  prediction_templates,
  prediction_templates_schema,
  predictions,
  predictions_schema,
} from "@prisma-zod/generated/zod.schema";

type predictionsWithTemplates = predictions & {
  prediction_templates: prediction_templates;
};

export async function getPredictionsAction(
  matchId: string
): Promise<predictionsWithTemplates[]> {
  try {
    const match_stream = await prisma.stream_matches.findUnique({
      where: {
        match_id: matchId,
      },
    });
    if (!match_stream) {
      return [];
    }
    // Get predictions for the match with their templates and options
    const predictions = await prisma.predictions.findMany({
      where: {
        stream_match_id: match_stream.id,
      },
      include: {
        prediction_templates: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    if (!predictions) {
      return [];
    }

    return predictions.map((prediction) => {
      return {
        ...predictions_schema.parse(prediction),
        prediction_templates: prediction_templates_schema.parse(
          prediction.prediction_templates
        ),
      };
    });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return [];
  }
}
