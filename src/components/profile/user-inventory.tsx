"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Package,
  Download,
  Coins,
  ArrowUpDown,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useCallback, useMemo } from "react";
import {
  formatDistanceToNow,
  isPast,
  isWithinInterval,
  subHours,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { getUserInventoryAction } from "@/actions/inventory/get-user-inventory-action";
import { withdrawItemAction } from "@/actions/inventory/withdraw-item-action";
import { exchangeItemsAction } from "@/actions/inventory/exchange-item-action";
import {
  steam_items,
  user_inventory_items,
} from "@prisma-zod/generated/zod.schema";
import { formatCurrency } from "@/lib/utils";

export default function UserInventory() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch user inventory data with TanStack Query
  const {
    data: inventoryResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-inventory"],
    queryFn: async () => {
      const response = await getUserInventoryAction();
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Withdraw item mutation
  const withdrawMutation = useMutation({
    mutationFn: async (steamItemId: string) => {
      return await withdrawItemAction(steamItemId);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast(t("inventory.withdraw.success.title"));
        queryClient.invalidateQueries({ queryKey: ["user-inventory"] });
      } else {
        toast(t("inventory.withdraw.error.title"));
      }
    },
    onError: (error) => {
      console.error("Withdraw error:", error);
      toast(t("inventory.withdraw.error.title"));
    },
  });

  // Exchange single item mutation
  const exchangeItemMutation = useMutation({
    mutationFn: async (steamItemId: string) => {
      return await exchangeItemsAction([steamItemId]);
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast(
          t("inventory.exchange.success.description", {
            amount: response.data.amount,
          })
        );
        queryClient.invalidateQueries({ queryKey: ["user-inventory"] });
      } else {
        toast(t("inventory.exchange.error.title"));
      }
    },
  });

  // Exchange all items mutation
  const exchangeAllMutation = useMutation({
    mutationFn: async (steamItemIds: string[]) => {
      return await exchangeItemsAction(steamItemIds);
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast(
          t("inventory.exchange.success.description", {
            amount: response.data.amount,
          })
        );
        queryClient.invalidateQueries({ queryKey: ["user-inventory"] });
      } else {
        toast(t("inventory.exchangeAll.error.title"));
      }
    },
  });

  // Show error toast when query fails - Fixed to prevent infinite loops
  useEffect(() => {
    if (isError && error) {
      toast(t("inventory.error.title"));
    }
  }, [isError, error, t, toast]);

  // Show error toast when server returns error - Fixed to prevent infinite loops
  useEffect(() => {
    if (inventoryResponse && inventoryResponse.error_message) {
      toast(t("inventory.error.title"));
    }
  }, [inventoryResponse?.success, inventoryResponse?.error_message, toast, t]);
  /**
   * Get expiration status and styling for an item
   */
  const getExpirationStatus = useCallback(
    (expiresIn: Date) => {
      const now = new Date();
      const isExpired = isPast(expiresIn);
      const isExpiringSoon = isWithinInterval(expiresIn, {
        start: now,
        end: subHours(now, -6), // Next 6 hours
      });

      if (isExpired) {
        return {
          text: t("inventory.expiration.expired"),
          variant: "destructive" as const,
          icon: AlertTriangle,
          timeText: t("inventory.expiration.expiredTime", {
            time: formatDistanceToNow(expiresIn, {
              locale: ptBR,
              addSuffix: true,
            }),
          }),
        };
      }

      if (isExpiringSoon) {
        return {
          text: t("inventory.expiration.expiringSoon"),
          variant: "secondary" as const,
          icon: Clock,
          timeText: formatDistanceToNow(expiresIn, {
            locale: ptBR,
            addSuffix: true,
          }),
        };
      }

      return {
        text: t("inventory.expiration.active"),
        variant: "outline" as const,
        icon: Clock,
        timeText:
          t("inventory.expiration.in") +
          " " +
          formatDistanceToNow(expiresIn, {
            locale: ptBR,
            addSuffix: true,
          }),
      };
    },
    [t]
  );

  /**
   * Get rarity gradient based on item type (reused from raffle card)
   */
  const getRarityGradient = useCallback((item_type: string) => {
    if (item_type.includes("Contraband")) {
      return "from-yellow-500/25 via-yellow-400/20 to-yellow-600/30";
    }
    if (item_type.includes("Covert")) {
      return "from-red-500/25 via-red-400/20 to-red-600/30";
    }
    if (item_type.includes("Classified")) {
      return "from-purple-500/25 via-purple-400/20 to-purple-600/30";
    }
    if (item_type.includes("Restricted")) {
      return "from-green-500/25 via-green-400/20 to-green-600/30";
    }
    if (item_type.includes("Mil-Spec")) {
      return "from-blue-500/25 via-blue-400/20 to-blue-600/30";
    }
    return "from-gray-500/25 via-gray-400/20 to-gray-600/30";
  }, []);

  /**
   * Get border color based on item type (reused from raffle card)
   */
  const getBorderColor = useCallback((item_type: string) => {
    if (item_type.includes("Contraband")) return "#ef9e1f";
    if (item_type.includes("Covert")) return "#eb4b4b";
    if (item_type.includes("Classified")) return "#d32be3";
    if (item_type.includes("Restricted")) return "#8a43fa";
    if (item_type.includes("Mil-Spec")) return "#4a6afa";
    if (item_type.includes("Industrial")) return "#5a9ada";
    return "#b0c2da";
  }, []);

  /**
   * Handle exchange all items
   */
  const handleExchangeAll = useCallback(() => {
    if (!inventoryResponse?.data?.item_data.length) return;

    const availableItems = inventoryResponse.data.item_data
      .filter(
        (item) =>
          !item.inventoty_item.in_trade &&
          !isPast(item.inventoty_item.expires_in)
      )
      .map((item) => item.steam_item.asset_id);

    if (availableItems.length === 0) {
      toast(t("inventory.exchangeAll.noItems.title"));
      return;
    }

    exchangeAllMutation.mutate(availableItems);
  }, [inventoryResponse?.data, exchangeAllMutation, toast, t]);

  /**
   * Render skeleton loader for inventory items with raffle card style
   */
  const renderSkeletonItems = useMemo(
    () => (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden border-2">
            <CardContent className="p-0">
              <Skeleton className="h-24 w-full animate-pulse" />
              <div className="p-2 space-y-2">
                <Skeleton className="h-3 w-3/4 animate-pulse" />
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-2 w-12 animate-pulse" />
                    <Skeleton className="h-2 w-8 animate-pulse" />
                  </div>
                  <Skeleton className="h-2 w-16 animate-pulse" />
                  <div className="flex gap-1">
                    <Skeleton className="h-4 w-12 animate-pulse" />
                    <Skeleton className="h-4 w-8 animate-pulse" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-2 pt-0">
              <div className="flex flex-col gap-1 w-full">
                <Skeleton className="h-6 w-full animate-pulse" />
                <Skeleton className="h-6 w-full animate-pulse" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    ),
    []
  );

  /**
   * Render individual inventory item card with raffle card style
   */
  const renderInventoryItem = useCallback(
    (
      item: user_inventory_items,
      steamItem: steam_items,
      cs2bits_rate: number
    ) => {
      const expirationStatus = getExpirationStatus(item.expires_in);
      const isExpired = isPast(item.expires_in);
      const isDisabled = item.in_trade || isExpired;
      const cs2bits_value = steamItem.estimated_fiat_value * cs2bits_rate;
      return (
        <Card
          key={`${item.user_id}-${item.steam_item_id}`}
          className={`pt-0 pb-1 overflow-hidden transition-all duration-300 border-2 hover:shadow-lg ${
            isDisabled ? "opacity-60" : ""
          }`}
          style={{
            borderColor: getBorderColor(steamItem.item_type),
          }}
          tabIndex={0}
          role="article"
          aria-label={t("inventory.item.ariaLabel", {
            name: steamItem.market_hash_name,
          })}
        >
          <div className="flex flex-col h-full">
            {/* Image Section with Rarity Gradient Background - styled like raffle card */}
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="relative w-full h-24 overflow-hidden rounded-lg">
                {/* Base background */}
                <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-muted/80"></div>

                {/* Rarity gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getRarityGradient(steamItem.item_type)}`}
                ></div>

                {/* Subtle pattern overlay for texture */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:15px_15px] opacity-30"></div>

                {/* Image container */}
                <div className="absolute inset-0 flex items-center justify-center p-2 z-10">
                  {steamItem.image_url ? (
                    <Image
                      src={steamItem.image_url}
                      alt={steamItem.market_hash_name}
                      width={80}
                      height={60}
                      className="object-contain max-h-20 drop-shadow-lg filter brightness-105"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground/60" />
                  )}
                </div>

                {/* Type badge with better visibility */}
                <Badge className="absolute top-1 right-1 z-20 bg-black/80 text-white border-white/20 backdrop-blur-sm hover:bg-black/90 text-xs px-1 py-0">
                  {steamItem.item_type}
                </Badge>

                {/* Expiration overlay for expired items */}
                {isExpired && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                )}
              </div>

              {/* Info Section - styled like raffle card */}
              <div className="p-2 flex-1 flex flex-col bg-gradient-to-b from-background to-background/95">
                <h3 className="font-medium text-xs mb-1 line-clamp-2 leading-tight">
                  {steamItem.market_hash_name}
                </h3>

                <div className="mt-auto space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <expirationStatus.icon className="h-2.5 w-2.5" />
                      <span className="text-xs truncate">
                        {expirationStatus.timeText}
                      </span>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex gap-1 flex-wrap">
                    {item.in_trade && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {t("inventory.badges.inTrade")}
                      </Badge>
                    )}
                    <Badge
                      variant={expirationStatus.variant}
                      className="text-xs px-1 py-0"
                    >
                      {expirationStatus.text}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Action buttons - styled like raffle card footer */}
            <CardFooter className="p-2 pt-0 bg-gradient-to-b from-background/95 to-background">
              <div className="flex flex-col gap-1 w-full">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-6 transition-all duration-200"
                  disabled={isDisabled || withdrawMutation.isPending}
                  onClick={() => withdrawMutation.mutate(item.steam_item_id)}
                >
                  <Download className="h-2.5 w-2.5 mr-1" />
                  {t("inventory.actions.withdraw")}
                </Button>

                <Button
                  size="sm"
                  variant="default"
                  className="w-full text-xs h-6 transition-all duration-200"
                  disabled={isDisabled || exchangeItemMutation.isPending}
                  onClick={() =>
                    exchangeItemMutation.mutate(item.steam_item_id)
                  }
                >
                  <Coins className="h-2.5 w-2.5 mr-1" />
                  {t("inventory.actions.exchange")}{" "}
                  {formatCurrency(cs2bits_value)}
                </Button>
              </div>
            </CardFooter>
          </div>
        </Card>
      );
    },
    [
      t,
      getExpirationStatus,
      formatCurrency,
      withdrawMutation,
      exchangeItemMutation,
      getRarityGradient,
      getBorderColor,
    ]
  );

  /**
   * Render empty state when no items found
   */
  const renderEmptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package
          className="h-16 w-16 text-muted-foreground mb-4"
          aria-hidden="true"
        />
        <h3 className="text-lg font-semibold mb-2">
          {t("inventory.empty.title")}
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          {t("inventory.empty.description")}
        </p>
        <button
          onClick={() => refetch()}
          className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          {t("inventory.empty.refresh")}
        </button>
      </div>
    ),
    [t, refetch]
  );

  /**
   * Render error state
   */
  const renderErrorState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle
          className="h-16 w-16 text-destructive mb-4"
          aria-hidden="true"
        />
        <h3 className="text-lg font-semibold mb-2">
          {t("inventory.error.title")}
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          {t("inventory.error.description")}
        </p>
        <button
          onClick={() => refetch()}
          className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          {t("inventory.error.retry")}
        </button>
      </div>
    ),
    [t, refetch]
  );

  const availableItemsCount = useMemo(
    () =>
      inventoryResponse?.data?.item_data.filter(
        (item) =>
          !item.inventoty_item.in_trade &&
          !isPast(item.inventoty_item.expires_in)
      ).length || 0,
    [inventoryResponse?.data]
  );

  return (
    <section
      className="space-y-6"
      aria-labelledby="inventory-heading"
      aria-live="polite"
      aria-busy={isLoading}
    >
      {/* Header with Exchange All button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2
            id="inventory-heading"
            className="text-2xl font-bold tracking-tight"
          >
            {t("inventory.title")}
          </h2>
          <p className="text-muted-foreground">{t("inventory.subtitle")}</p>
        </div>

        {inventoryResponse?.success &&
          inventoryResponse.data &&
          inventoryResponse.data?.item_data.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-sm text-muted-foreground text-right">
                <div>
                  {t("inventory.itemCount", {
                    count: inventoryResponse.data.item_data.length,
                  })}
                </div>
                <div className="font-semibold text-primary">
                  {t("inventory.totalValue")}:{" "}
                  {formatCurrency(inventoryResponse.data.total_cs2bits_value)}
                </div>
              </div>

              {availableItemsCount > 0 && (
                <Button
                  onClick={handleExchangeAll}
                  disabled={exchangeAllMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {t("inventory.actions.exchangeAll")}
                  <span className="ml-1 px-2 py-0.5 bg-primary-foreground text-primary rounded text-xs font-semibold">
                    {formatCurrency(inventoryResponse.data.total_cs2bits_value)}
                  </span>
                </Button>
              )}
            </div>
          )}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading && renderSkeletonItems}

        {isError && renderErrorState}

        {inventoryResponse?.success &&
          inventoryResponse.data?.item_data.length === 0 &&
          renderEmptyState}

        {inventoryResponse?.success &&
          inventoryResponse.data &&
          inventoryResponse.data.item_data.length > 0 && (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3"
              role="grid"
              aria-label={t("inventory.grid.ariaLabel")}
            >
              {inventoryResponse.data?.item_data.map((i) =>
                renderInventoryItem(
                  i.inventoty_item,
                  i.steam_item,
                  i.cs2bits_rate
                )
              )}
            </div>
          )}
      </div>
    </section>
  );
}
