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
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Hourglass,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getUserTradesAction,
  GetUserTradesActionResponse,
} from "@/actions/user/get-user-trades-action";
import { trade_offer_status } from "@prisma-zod/generated/zod.schema";
import Image from "next/image";

export function TradeHistory() {
  // Estados apenas para filtro e página
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();

  // React Query para buscar trades
  const { data, isLoading, isFetching } =
    useQuery<GetUserTradesActionResponse | null>({
      queryKey: ["user-trades", currentPage],
      queryFn: async () => {
        const result = await getUserTradesAction({
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
    return <TradeHistorySkeleton />;
  }

  const getStatusColor = (status: trade_offer_status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "declined":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "expired":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: trade_offer_status) => {
    switch (status) {
      case "new":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <Hourglass className="h-4 w-4 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "declined":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const tradesData = data?.tradesData || [];
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
            {t("userProfile.trades.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("userProfile.trades.total", { count: pagination.total })}
          </p>
        </div>
      </div>

      {tradesData.length === 0 ? (
        <>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ArrowUpDown className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">
              {t("userProfile.trades.noActivity")}
            </h3>
            <p className="text-muted-foreground mt-2">
              {t("userProfile.trades.noActivityDescription")}
            </p>
          </div>
        </>
      ) : null}

      {isFetching && tradesData.length > 0 ? (
        <TradeListSkeleton />
      ) : (
        <ScrollArea className="h-[500px] w-full">
          <div className="space-y-3">
            {tradesData.map((data) => (
              <Card key={data.trade_offer.id} className="p-4">
                <div className="flex flex-col space-y-4">
                  {/* Trade offer header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(data.trade_offer.status)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={getStatusColor(data.trade_offer.status)}
                          >
                            {t(`trades.status.${data.trade_offer.status}`)}
                          </Badge>
                          {data.trade_offer.trade_offer_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={
                                !(data.trade_offer.status === "pending")
                              }
                              onClick={() =>
                                window.open(
                                  `https://steamcommunity.com/tradeoffer/${data.trade_offer.trade_offer_id}`,
                                  "_blank"
                                )
                              }
                              className="h-6 px-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            data.trade_offer.created_at,
                            "dd/MM/yyyy HH:mm"
                          )}
                        </p>
                        {data.trade_offer.expires_in && (
                          <p className="text-xs text-muted-foreground">
                            {t("trades.expiresAt")}:{" "}
                            {format(
                              data.trade_offer.expires_in,
                              "dd/MM/yyyy HH:mm"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {t("trades.itemCount", {
                          count: data.trade_offer_items.length,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Trade offer items */}
                  {data.trade_offer_items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {t("trades.items")}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {data.trade_offer_items.map((item, index) => (
                          <div
                            key={`${data.trade_offer.id}-${item.steam_item.asset_id}-${index}`}
                            className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                          >
                            <div className="flex-shrink-0">
                              {item.steam_item.image_url ? (
                                <Image
                                  src={item.steam_item.image_url}
                                  alt={item.steam_item.market_hash_name}
                                  width={32}
                                  height={32}
                                  className="object-contain rounded"
                                  crossOrigin="anonymous"
                                />
                              ) : (
                                <Package className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium line-clamp-1">
                                {item.steam_item.market_hash_name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs h-4 px-1"
                                >
                                  {t(
                                    `trades.action.${item.trade_offer_item.trade_action}`
                                  )}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

export function TradeHistorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <TradeListSkeleton />
    </div>
  );
}

export function TradeListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div
                    key={j}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                  >
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-8" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
