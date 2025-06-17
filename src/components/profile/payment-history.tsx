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
  ArrowUpCircle,
  History,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  ShieldAlert,
  CircleX,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getUserPaymentsAction,
  GetUserPaymentsActionResponse,
} from "@/actions/user/get-user-payments";
import { formatCurrency } from "@/lib/utils";
import { payment_status } from "@prisma-zod/generated/zod.schema";

export function PaymentHistory() {
  // Estados apenas para filtro e página
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();

  // React Query para buscar transações
  const { data, isLoading, isFetching } =
    useQuery<GetUserPaymentsActionResponse | null>({
      queryKey: ["user-payments", currentPage],
      queryFn: async () => {
        const result = await getUserPaymentsAction({
          page: currentPage,
          limit: 20,
        });
        return result.data ?? null;
      },
    });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <TransactionHistorySkeleton />;
  }

  const getTextColror = (type: payment_status) => {
    switch (type) {
      case "Pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Failed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTransactionIcon = (type: payment_status) => {
    switch (type) {
      case "Pending":
        return <RefreshCcw className="h-4 w-4 text-orange-500" />;
      case "Processing":
        return <RefreshCcw className="h-4 w-4 text-blue-500" />;
      case "Completed":
        return <ArrowUpCircle className="h-4 w-4 text-green-500" />;
      case "Canceled":
        return <CircleX className="h-4 w-4 text-red-500" />;
      case "Failed":
        return <CircleX className="h-4 w-4 text-purple-500" />;
      case "Refunded":
        return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
    }
  };

  const paymentsData = data?.paymentsData || [];
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
          <h3 className="text-lg font-medium">
            {t("userProfile.payments.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("userProfile.payments.total", { count: pagination.total })}
          </p>
        </div>
      </div>

      {paymentsData.length === 0 ? (
        <>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">
              {t("userProfile.history.noActivity")}
            </h3>
            <p className="text-muted-foreground mt-2">
              {t("userProfile.history.noActivityDescription")}
            </p>
          </div>
        </>
      ) : null}

      {isFetching && paymentsData.length > 0 ? (
        <TransactionListSkeleton />
      ) : (
        <ScrollArea className="h-[500px] w-full">
          <div className="space-y-3">
            {paymentsData.map((data) => (
              <Card key={data.user_payment.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(data.user_payment.status)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={getTextColror(data.user_payment.status)}
                        >
                          ID: {data.user_payment.id}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t(`payment.status.${data.user_payment.status}`)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          data.user_payment.created_at,
                          "dd/MM/yyyy HH:mm"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium $text-green-600 dark:text-green-400`}
                    >
                      {formatCurrency(
                        Number(
                          data.point_packages.points_amount +
                            data.point_packages.bonus_points
                        )
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="text-sm text-muted-foreground">
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
                      className="w-8 h-8 p-0"
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
                <Skeleton className="h-5 w-60" />
                <Skeleton className="h-4 w-40" />
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
