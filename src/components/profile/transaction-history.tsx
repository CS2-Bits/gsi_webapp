"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Gift,
  RefreshCw,
  CreditCard,
  Target,
  History,
  ChevronLeft,
  ChevronRight,
  Ticket,
} from "lucide-react";
import {
  getUserTransactionsAction,
  GetUserTransactionsActionResponse,
} from "@/actions/user/get-user-transactions-action";
import { useQuery } from "@tanstack/react-query";
import {
  point_packages,
  transaction_type,
  user_payments,
  user_predictions,
} from "@prisma-zod/generated/zod.schema";

const getTransactionIcon = (type: transaction_type) => {
  switch (type) {
    case "Deposit":
    case "DepositSteamItem":
      return <ArrowUpCircle className="h-4 w-4 text-green-500" />;
    case "Reward":
    case "Gift":
      return <Gift className="h-4 w-4 text-yellow-500" />;
    case "Predict":
      return <Target className="h-4 w-4 text-blue-500" />;
    case "RaffleTicket":
      return <Ticket className="h-4 w-4 text-blue-500" />;
    case "ExchangeSteamItem":
      return <RefreshCw className="h-4 w-4 text-purple-500" />;
    case "Refund":
      return <ArrowDownCircle className="h-4 w-4 text-orange-500" />;
    default:
      return <CreditCard className="h-4 w-4 text-gray-500" />;
  }
};

const getTransactionColor = (type: transaction_type) => {
  switch (type) {
    case "Deposit":
    case "DepositSteamItem":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Reward":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "Predict":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "RaffleTicket":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "ExchangeSteamItem":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "Refund":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export function TransactionHistory() {
  // Estados apenas para filtro e página
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<transaction_type | undefined>(undefined);
  const { t } = useTranslation();

  // React Query para buscar transações
  const { data, isLoading, isFetching } =
    useQuery<GetUserTransactionsActionResponse | null>({
      queryKey: ["user-transactions", currentPage, filter],
      queryFn: async () => {
        const result = await getUserTransactionsAction(
          {
            page: currentPage,
            limit: 20,
          },
          filter ? [filter] : []
        );
        return result.data ?? null;
      },
    });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (value: string) => {
    const newFilter = value === "all" ? undefined : (value as transaction_type);
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const formatAmount = (amount: number, type: transaction_type) => {
    const sign = type === "Predict" || type === "RaffleTicket" ? "" : "+";
    return `${sign}${amount.toLocaleString("pt-BR")} ${t("common.points")}`;
  };

  const getTransactionDescription = (
    type: transaction_type,
    user_payments_data?: {
      user_payment: user_payments;
      point_package: point_packages;
    }[],
    user_predictions?: user_predictions[]
  ) => {
    // Gerar descrição baseada no tipo
    switch (type) {
      case "Deposit":
        if (user_payments_data && user_payments_data.length > 0) {
          const user_payment = user_payments_data[0].user_payment;
          const point_package = user_payments_data[0].point_package;
          const totalAmount =
            point_package.points_amount + point_package.bonus_points;
          return t("transactions.descriptions.deposit", {
            provider: user_payment.provider,
            amount: Number(totalAmount).toLocaleString("pt-BR", {
              style: "currency",
              currency: point_package.currency,
            }),
          });
        }
        return t("transactions.descriptions.depositGeneric");

      case "DepositSteamItem":
        return t("transactions.descriptions.depositSteamItem");

      case "Predict":
        if (user_predictions && user_predictions.length > 0) {
          const user_prediction = user_predictions[0];
          return t("transactions.descriptions.predict", {
            option: t(`predictions.options.${user_prediction.option_label}`),
          });
        }
        return t("transactions.descriptions.predictGeneric");

      case "Reward":
        return t("transactions.descriptions.reward");

      case "RaffleTicket":
        return t("transactions.descriptions.raffleTicket");

      case "ExchangeSteamItem":
        return t("transactions.descriptions.exchange");

      case "Refund":
        return t("transactions.descriptions.refund");

      default:
        return t("transactions.descriptions.unknown");
    }
  };

  if (isLoading) {
    return <TransactionHistorySkeleton />;
  }

  const transactionsData = data?.transactionsData || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="gaming-text-primary text-lg font-medium">
            {t("userProfile.history.title")}
          </h3>
          <p className="gaming-text-secondary text-base">
            {t("userProfile.history.total", { count: pagination.total })}
          </p>
        </div>
        <Select value={filter || "all"} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("transactions.filter.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("transactions.filter.all")}</SelectItem>
            <SelectItem value="Deposit">
              {t("transactions.types.deposit")}
            </SelectItem>
            <SelectItem value="Reward">
              {t("transactions.types.reward")}
            </SelectItem>
            <SelectItem value="Predict">
              {t("transactions.types.predict")}
            </SelectItem>
            <SelectItem value="Exchange">
              {t("transactions.types.exchange")}
            </SelectItem>
            <SelectItem value="DepositSteamItem">
              {t("transactions.types.depositSteamItem")}
            </SelectItem>
            <SelectItem value="RaffleTicket">
              {t("transactions.types.raffleticket")}
            </SelectItem>
            <SelectItem value="Refund">
              {t("transactions.types.refund")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {transactionsData.length === 0 ? (
        <>
          <div className="gaming-card flex flex-col items-center justify-center py-12 text-center">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="gaming-text-accent text-lg font-medium">
              {t("userProfile.history.noActivity")}
            </h3>
            <p className="gaming-text-secondary mt-2">
              {t("userProfile.history.noActivityDescription")}
            </p>
          </div>
        </>
      ) : null}

      {isFetching && transactionsData.length > 0 ? (
        <TransactionListSkeleton />
      ) : (
        <ScrollArea className="h-[500px] w-full">
          <div className="space-y-3">
            {transactionsData.map((data, index) => (
              <div
                key={data.transaction.id}
                className="gaming-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card className="gaming-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(data.transaction.type)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={getTransactionColor(
                              data.transaction.type
                            )}
                          >
                            {t(
                              `transactions.types.${data.transaction.type.toLowerCase()}`
                            )}
                          </Badge>
                        </div>
                        <p className="gaming-text-secondary text-base">
                          {getTransactionDescription(
                            data.transaction.type,
                            data.user_payments_data
                          )}
                        </p>
                        <p className="gaming-text-secondary text-sm">
                          {format(
                            data.transaction.created_at,
                            "dd/MM/yyyy HH:mm"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          data.transaction.type === "Predict" ||
                          data.transaction.type === "RaffleTicket"
                            ? "text-orange-600 dark:text-orange-400"
                            : "gaming-text-primary"
                        }`}
                      >
                        {formatAmount(
                          Number(data.transaction.amount),
                          data.transaction.type
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="gaming-text-secondary text-base">
            {t("pagination.showing", {
              start: (pagination.page - 1) * pagination.limit + 1,
              end: Math.min(
                pagination.page * pagination.limit,
                pagination.total
              ),
              total: pagination.total,
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gaming-button text-foreground hover:scale-105 transition-transform"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev || isFetching}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("pagination.previous")}
            </Button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNumber;
                  if (pagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNumber = pagination.totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={
                        currentPage === pageNumber ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={isFetching}
                      className={`w-8 h-8 p-0 ${currentPage === pageNumber ? "gaming-button text-foreground" : ""}`}
                    >
                      {pageNumber}
                    </Button>
                  );
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gaming-button text-foreground hover:scale-105 transition-transform"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext || isFetching}
            >
              {t("pagination.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TransactionHistorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-full sm:w-[180px]" />
      </div>
      <TransactionListSkeleton />
    </div>
  );
}

export function TransactionListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );
}
