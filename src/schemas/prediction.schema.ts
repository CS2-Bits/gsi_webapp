import { z } from "zod";
import { option_label } from "@prisma/client";
import {
  predictions_schema,
  user_predictions_schema,
} from "@prisma-zod/generated/zod.schema";

// Base schemas for database entities
export const PredictionOptionSchema = z.object({
  label: z.nativeEnum(option_label),
  template_id: z.number(),
  created_at: z.preprocess(
    (arg) => (typeof arg === "string" ? new Date(arg) : arg),
    z.date()
  ),
});
// Enhanced schemas with calculated fields
export const EnhancedPredictionOptionSchema = PredictionOptionSchema.extend({
  betCount: z.number(),
  amount: z.number(),
  percentage: z.number(),
  odds: z.number(),
  userAmount: z.number(),
});

export const EnhancedPredictionSchema = predictions_schema.extend({
  totalBets: z.number(),
  totalAmount: z.number(),
  options: z.array(EnhancedPredictionOptionSchema),
  userTotalBets: z.number(),
  user_bets: z.array(user_predictions_schema).optional(),
});

export const PredictionDetailSchema = z.object({
  totalBets: z.number(),
  totalAmount: z.number(),
  options: z.array(EnhancedPredictionOptionSchema),
  userTotalBets: z.number(),
  user_bets: z.array(user_predictions_schema).optional(),
});

// Type exports
export type PredictionOption = z.infer<typeof PredictionOptionSchema>;
export type EnhancedPrediction = z.infer<typeof EnhancedPredictionSchema>;
export type EnhancedPredictionOption = z.infer<
  typeof EnhancedPredictionOptionSchema
>;

export type PredictionDetail = z.infer<typeof PredictionDetailSchema>;

export type OptionLabel = option_label;

export const PlaceBetSchema = z.object({
  predictionId: z.string(),
  optionLabel: z.nativeEnum(option_label),
  amount: z.number().min(0.01),
});

export type PlaceBetInput = z.infer<typeof PlaceBetSchema>;
