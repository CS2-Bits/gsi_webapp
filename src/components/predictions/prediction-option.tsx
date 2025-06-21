"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Trophy } from "lucide-react";
import type { EnhancedPredictionOption } from "@/schemas/prediction.schema";
import { useTranslation } from "react-i18next";

interface PredictionOptionProps {
  option: EnhancedPredictionOption;
  isSelected: boolean;
  isWinner: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function PredictionOption({
  option,
  isSelected,
  isWinner,
  onClick,
  disabled,
}: PredictionOptionProps) {
  const percentage = option.percentage || 0;
  const formattedPercentage = percentage.toFixed(0);
  const formattedOdds =
    option.odds > 0 ? `1:${option.odds.toFixed(2)}` : "1:1.00";

  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "relative p-3 rounded-md border transition-all cursor-pointer hover:bg-accent/50 gaming-card-interactive",
        isSelected && "border-primary bg-primary/10 gaming-glow",
        isWinner && "border-green-500 bg-green-500/10 gaming-pulse",
        disabled && "opacity-80 cursor-default"
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="font-medium flex items-center gap-1.5 gaming-text-accent">
          {t(`predictions.labels.${option.label}`)}
          {isSelected && (
            <CheckCircle2 size={16} className="text-primary gaming-pop" />
          )}
          {isWinner && (
            <Trophy size={16} className="text-green-500 gaming-pop" />
          )}
        </div>
        <div className="text-base font-mono gaming-text-primary">
          {formattedPercentage}%
        </div>
      </div>

      <Progress value={percentage} className="h-2 mb-2" />

      <div className="flex justify-between items-center text-sm gaming-text-secondary">
        <div>
          {option.betCount} {t("predictions.bets")}
        </div>
        <div className="font-mono">{formattedOdds}</div>
      </div>

      {option.userAmount > 0 && (
        <div className="mt-1 text-sm gaming-text-primary font-medium">
          You bet: {option.userAmount.toFixed(2)}
        </div>
      )}
    </div>
  );
}
