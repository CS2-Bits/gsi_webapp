"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Flame } from "lucide-react";
import { PredictionCard } from "./prediction-card";
import {
  prediction_templates,
  predictions,
  streamers,
} from "@prisma-zod/generated/zod.schema";

type Prediction = predictions & {
  prediction_templates: prediction_templates;
};

interface PredictionsListProps {
  streamer: streamers;
  predictions: Prediction[];
  currentRound: number;
}

export function PredictionsList({
  streamer,
  predictions,
  currentRound,
}: PredictionsListProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {predictions.length === 0 ? (
        <div className="gaming-slide-up">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="gaming-text-accent flex items-center gap-2">
                <Flame size={18} className="text-primary gaming-pulse" />
                {t("predictions.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="gaming-text-secondary">
                {t("predictions.no_predictions")}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        predictions.map((prediction, index) => (
          <div
            key={prediction.id}
            className="gaming-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PredictionCard
              streamer={streamer}
              prediction={prediction}
              currentRound={currentRound}
            />
          </div>
        ))
      )}
    </div>
  );
}
