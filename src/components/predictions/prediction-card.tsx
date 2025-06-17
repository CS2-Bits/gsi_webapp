"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import { placeBetAction } from "@/actions/predictions/place-bet-action";
import { PredictionOption } from "./prediction-option";
import { Clock, Trophy, AlertCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { getUserBalanceAction } from "@/actions/user/get-user-balance-action";
import {
  PredictionDetailSchema,
  type OptionLabel,
  type PredictionDetail,
} from "@/schemas/prediction.schema";

// shadcn form + zod
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "../ui/skeleton";
import { getPredictionsDetailsAction } from "@/actions/predictions/get-predictions-details-action";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  prediction_templates,
  predictions,
  streamers,
} from "@prisma-zod/generated/zod.schema";

type Prediction = predictions & {
  prediction_templates: prediction_templates;
};

interface PredictionCardProps {
  streamer: streamers;
  prediction: Prediction;
  currentRound: number;
}

export function PredictionCard({
  streamer,
  prediction,
  currentRound,
}: PredictionCardProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [selectedOptionLabel, setSelectedOptionLabel] =
    useState<OptionLabel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHasBet, setUserHasBet] = useState(false);
  const [predictionDetails, setPredictionDetails] =
    useState<PredictionDetail | null>(null);

  const qc = useQueryClient();

  const { data: userBalance } = useQuery({
    queryKey: ["userBalance"],
    queryFn: async () => {
      const response = await getUserBalanceAction();
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    },
    enabled: !!session,
    refetchOnWindowFocus: false,
  });

  const { data: predictionDetailsData, isRefetching } = useQuery({
    queryKey: ["predictionDetails", prediction.id],
    queryFn: async () => {
      const response = await getPredictionsDetailsAction(prediction.id);
      if (response.data) {
        return PredictionDetailSchema.parse(response.data);
      }
    },
    enabled: !!prediction.id,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (predictionDetailsData) {
      setPredictionDetails(predictionDetailsData);
      setUserHasBet(predictionDetailsData.userTotalBets > 0);
    }
  }, [predictionDetailsData, isRefetching]);

  const isOpen = prediction.state === "Open";
  const isResolved = prediction.state === "Resolved";
  const isClosed = prediction.state === "Closed";
  const isCanceled = prediction.state === "Canceled";
  const isRoundThresholdReached =
    currentRound >= prediction.prediction_templates.threshold_round;

  // Zod schema para o form
  const betSchema = z.object({
    amount: z
      .string()
      .refine(
        (val) => {
          const num = Number(val);
          return !isNaN(num) && num > 0;
        },
        { message: t("predictions.enter_valid_amount") }
      )
      .refine(
        (val) =>
          Number(val) <= Number(prediction.prediction_templates.max_bet_amount),
        {
          message: t("predictions.minimum_bet_description", {
            amount: prediction.prediction_templates.min_bet_amount,
          }),
        }
      )
      .refine(
        (val) =>
          Number(val) >= Number(prediction.prediction_templates.min_bet_amount),
        {
          message: t("predictions.minimum_bet_description", {
            amount: prediction.prediction_templates.min_bet_amount,
          }),
        }
      )
      .refine(
        (val) =>
          userBalance != null
            ? Number(val) <= Number(userBalance.balance)
            : false,
        {
          message: t("predictions.insufficient_balance"),
        }
      ),
  });

  const form = useForm<z.infer<typeof betSchema>>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      amount: "",
    },
  });
  // Reset selected option and bet amount when prediction state changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedOptionLabel(null);
      form.reset({ amount: "" });
    }
  }, [isOpen, form]);

  const handleSelectOption = (optionId: OptionLabel) => {
    if (!isOpen || !userBalance) return;
    setSelectedOptionLabel(optionId);
  };

  const handlePlaceBet = async (values: { amount: string }) => {
    if (!session) {
      toast.error(t("user.login_required"), {
        description: t("predictions.login_to_bet"),
      });
      return;
    }
    if (!selectedOptionLabel) {
      toast.error(t("predictions.select_option"), {
        description: t("predictions.select_option_description"),
      });
      return;
    }
    const amount = Number.parseFloat(values.amount);
    setIsSubmitting(true);

    const result = await placeBetAction({
      predictionId: prediction.id,
      optionLabel: selectedOptionLabel,
      amount,
    });

    qc.invalidateQueries({ queryKey: ["userBalance"] });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(t("predictions.bet_placed"));
      form.reset({ amount: "" });
      setSelectedOptionLabel(null);
    } else {
      toast.error(t("predictions.bet_failed"));
    }
  };

  const getStatusBadge = () => {
    if (isResolved) {
      return <Badge>{t("predictions.resolved")}</Badge>;
    } else if (isClosed) {
      return <Badge variant="secondary">{t("predictions.closed")}</Badge>;
    } else if (isCanceled) {
      return <Badge variant="destructive">{t("predictions.canceled")}</Badge>;
    } else if (isRoundThresholdReached) {
      return <Badge>{t("predictions.ending_soon")}</Badge>;
    } else {
      return <Badge variant="default">{t("predictions.open")}</Badge>;
    }
  };

  // Quick bet buttons
  const quickBetAmounts = [
    prediction.prediction_templates.min_bet_amount,
    prediction.prediction_templates.min_bet_amount * 5,
    prediction.prediction_templates.min_bet_amount * 10,
  ];
  const handleQuickBet = (amount: number) => {
    form.setValue("amount", amount.toString());
    form.clearErrors("amount");
  };
  const handleAllIn = () => {
    form.setValue("amount", userBalance?.balance.toString() ?? "");
    form.clearErrors("amount");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">
            {t(`predictions.${prediction.prediction_templates.kind}`, {
              streamer: streamer.username_id,
              round: prediction.prediction_templates.threshold_round + 0.5,
            })}
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>{t(`predictions.select_description`)}</CardDescription>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Clock size={14} />
          <span>
            {formatDistance(prediction.created_at, new Date(), {
              locale: ptBR,
            })}
          </span>
          {isOpen && !isRoundThresholdReached && (
            <>
              <span className="mx-1">•</span>
              <AlertCircle size={14} />
              <span>
                {t("predictions.closes_at_round", {
                  round: prediction.prediction_templates.threshold_round,
                })}
              </span>
            </>
          )}
        </div>
      </CardHeader>
      {!predictionDetails ? (
        <PredictionCardLoading />
      ) : (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {predictionDetails.options.map((option) => (
              <PredictionOption
                key={option.label}
                option={option}
                isSelected={selectedOptionLabel === option.label}
                isWinner={
                  isResolved && prediction.winning_option_label === option.label
                }
                onClick={() => handleSelectOption(option.label)}
                disabled={!isOpen}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>
                {predictionDetails.totalBets} {t("predictions.bets")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy size={14} />
              <span>
                {t("predictions.total_pool")}:{" "}
                {predictionDetails.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {isOpen && userBalance && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handlePlaceBet)}
                className="space-y-2 pt-2 border-t"
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("predictions.enter_amount")}
                            {...field}
                            className={`flex-1`}
                            disabled={!selectedOptionLabel || isSubmitting}
                            min={Number(
                              prediction.prediction_templates.min_bet_amount
                            )}
                          />
                        </FormControl>
                        <Button
                          type="submit"
                          disabled={!selectedOptionLabel || isSubmitting}
                          className="whitespace-nowrap"
                        >
                          {t("predictions.place_bet")}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quick bet buttons */}
                <div className="flex gap-2 mt-2">
                  {quickBetAmounts.map((amount) => (
                    <Button
                      key={amount.toString()}
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => handleQuickBet(amount)}
                      disabled={
                        !selectedOptionLabel ||
                        isSubmitting ||
                        amount > userBalance.balance
                      }
                      className="flex-1"
                    >
                      {Number(amount)}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleAllIn}
                    disabled={
                      !selectedOptionLabel ||
                      isSubmitting ||
                      userBalance.balance <= 0
                    }
                    className="flex-1"
                  >
                    {t("predictions.all_in")}
                  </Button>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">
                    {t("predictions.min_bet")}:{" "}
                    {Number(prediction.prediction_templates.min_bet_amount)}
                  </p>
                </div>
              </form>
            </Form>
          )}

          {userHasBet && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">
                {t("predictions.your_bets")}:{" "}
                {predictionDetails.userTotalBets.toFixed(2)}
              </p>
            </div>
          )}

          {/* {isResolved && prediction.winning_option_label && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-green-500">
                {t("predictions.winner")}:{" "}
                {
                  predictionDetails.options.find(
                    (o) => o.label === prediction.winning_option_label,
                  )?.label
                }
              </p>
            </div>
          )} */}

          {isCanceled && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">
                {t("predictions.canceled_description")}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function PredictionCardLoading() {
  return (
    <CardContent className="space-y-4">
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  );
}
