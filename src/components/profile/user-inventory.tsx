"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FaSteam } from "react-icons/fa";
import {
  AlertCircle,
  Package,
  Download,
  Coins,
  ArrowUpDown,
  Clock,
  AlertTriangle,
  Zap,
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
import type {
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
        queryClient.invalidateQueries({ queryKey: ["userBalance"] });
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

  // Show error toast when query fails
  useEffect(() => {
    if (isError && error) {
      toast(t("inventory.error.title"));
    }
  }, [isError, error, t]);

  // Show error toast when server returns error
  useEffect(() => {
    if (inventoryResponse && inventoryResponse.error_message) {
      toast(t("inventory.error.title"));
    }
  }, [inventoryResponse, t]);

  /**
   * Get enhanced expiration status with more engaging messaging
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
          timeText: t("inventory.expiration.expiredMessage"),
          urgency: "critical",
          bgColor: "bg-red-500/10",
          textColor: "text-red-600",
          pulseAnimation: true,
        };
      }

      if (isExpiringSoon) {
        return {
          text: t("inventory.expiration.expiringSoon"),
          variant: "secondary" as const,
          icon: Zap,
          timeText: `${t("inventory.expiration.in")} ${formatDistanceToNow(
            expiresIn,
            {
              locale: ptBR,
              addSuffix: true,
            }
          )}`,
          urgency: "high",
          bgColor: "bg-orange-500/10",
          textColor: "text-orange-600",
          pulseAnimation: true,
        };
      }

      return {
        text: t("inventory.expiration.active"),
        variant: "outline" as const,
        icon: Clock,
        timeText: `${t("inventory.expiration.in")} ${formatDistanceToNow(
          expiresIn,
          {
            locale: ptBR,
            addSuffix: true,
          }
        )}`,
        urgency: "low",
        bgColor: "bg-green-500/10",
        textColor: "text-green-600",
        pulseAnimation: false,
      };
    },
    [t]
  );

  /**
   * Get enhanced rarity styling with more vibrant gradients
   */
  const getRarityGradient = useCallback((item_type: string) => {
    if (item_type.includes("Contraband")) {
      return "from-yellow-400/40 via-yellow-300/30 to-amber-500/40";
    }
    if (item_type.includes("Covert")) {
      return "from-red-500/40 via-red-400/30 to-rose-600/40";
    }
    if (item_type.includes("Classified")) {
      return "from-purple-500/40 via-purple-400/30 to-violet-600/40";
    }
    if (item_type.includes("Restricted")) {
      return "from-green-500/40 via-green-400/30 to-emerald-600/40";
    }
    if (item_type.includes("Mil-Spec")) {
      return "from-blue-500/40 via-blue-400/30 to-cyan-600/40";
    }
    return "from-gray-500/30 via-gray-400/20 to-slate-600/30";
  }, []);

  /**
   * Get enhanced border styling with glow effects
   */
  const getBorderColor = useCallback((item_type: string) => {
    if (item_type.includes("Contraband")) return "#f59e0b";
    if (item_type.includes("Covert")) return "#ef4444";
    if (item_type.includes("Classified")) return "#a855f7";
    if (item_type.includes("Restricted")) return "#10b981";
    if (item_type.includes("Mil-Spec")) return "#3b82f6";
    if (item_type.includes("Industrial")) return "#6b7280";
    return "#9ca3af";
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
  }, [inventoryResponse?.data, exchangeAllMutation, t]);

  /**
   * Enhanced skeleton loader
   */
  const renderSkeletonItems = useMemo(
    () => (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden border-2 min-h-[280px]">
            <CardContent className="p-0">
              <Skeleton className="h-32 w-full animate-pulse" />
              <div className="p-3 space-y-3">
                <Skeleton className="h-4 w-3/4 animate-pulse" />
                <Skeleton className="h-3 w-1/2 animate-pulse" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full animate-pulse" />
                  <Skeleton className="h-8 w-full animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    []
  );

  /**
   * Enhanced inventory item card with better visual hierarchy
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
          className={`pt-0 pb-1 overflow-hidden transition-all duration-300 border-2 hover:shadow-xl hover:scale-[1.02] group min-h-[280px] ${
            isDisabled ? "opacity-60 grayscale" : ""
          } ${expirationStatus.pulseAnimation ? "animate-pulse" : ""}`}
          style={{
            borderColor: getBorderColor(steamItem.item_type),
            boxShadow: `0 0 20px ${getBorderColor(steamItem.item_type)}20`,
          }}
          tabIndex={0}
          role="article"
          aria-label={t("inventory.item.ariaLabel", {
            name: steamItem.market_hash_name,
          })}
        >
          <div className="flex flex-col h-full">
            {/* Enhanced Image Section */}
            <CardContent className="p-0 flex-1">
              <div className="relative w-full h-28 overflow-hidden">
                {/* Enhanced background with animated gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-muted/90"></div>
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getRarityGradient(steamItem.item_type)} group-hover:opacity-80 transition-opacity duration-300`}
                ></div>

                {/* Animated pattern overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:20px_20px] opacity-40 group-hover:animate-pulse"></div>

                {/* Enhanced image container */}
                <div className="absolute inset-0 flex items-center justify-center p-3 z-10">
                  {steamItem.image_url ? (
                    <Image
                      src={steamItem.image_url || "/placeholder.svg"}
                      alt={steamItem.market_hash_name}
                      width={100}
                      height={80}
                      className="object-contain max-h-24 drop-shadow-2xl filter brightness-110 group-hover:scale-110 transition-transform duration-300"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground/60" />
                  )}
                </div>

                {/* Item name positioned at bottom left of image */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 z-20">
                  <h3 className="font-bold text-sm line-clamp-2 leading-tight text-white drop-shadow-lg">
                    {steamItem.market_hash_name}
                  </h3>
                </div>

                {/* Enhanced expiration overlay */}
                {isExpired && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-1" />
                      <span className="text-red-400 font-bold text-sm">
                        {t("inventory.expiration.expired")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Info Section */}
              <div className="p-2 flex-1 flex flex-col bg-gradient-to-b from-background to-background/95">
                {/* Enhanced status section */}
                <div className="space-y-2">
                  {/* Expiration status with enhanced styling */}
                  <div
                    className={`flex items-start gap-2 p-2 rounded-lg ${expirationStatus.bgColor}`}
                  >
                    <expirationStatus.icon
                      className={`h-4 w-4 ${expirationStatus.textColor} flex-shrink-0 mt-0.5`}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-bold text-xs ${expirationStatus.textColor}`}
                      >
                        {expirationStatus.text}
                      </div>
                      <div className="text-xs text-muted-foreground break-words">
                        {expirationStatus.timeText}
                      </div>
                    </div>
                  </div>

                  {/* Trade status badge */}
                  {item.in_trade && (
                    <Badge
                      variant="secondary"
                      className="w-full justify-center text-xs py-1"
                    >
                      🔒 {t("inventory.badges.inTrade")}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>

            {/* Enhanced Action Section */}
            <CardFooter className="p-2 pt-0 bg-gradient-to-b from-background/95 to-background">
              <div className="flex flex-col gap-2 w-full">
                {/* Enhanced action buttons - single column */}
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full text-sm h-10 transition-all duration-200 hover:scale-105"
                  disabled={isDisabled || withdrawMutation.isPending}
                  onClick={() => withdrawMutation.mutate(item.steam_item_id)}
                >
                  <FaSteam className="h-10 w-10" />
                  {t("inventory.actions.withdraw")}
                </Button>

                <Button
                  size="lg"
                  variant="default"
                  className="w-full text-sm h-auto min-h-[2.5rem] py-2 transition-all duration-200 hover:scale-105 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  disabled={isDisabled || exchangeItemMutation.isPending}
                  onClick={() =>
                    exchangeItemMutation.mutate(item.steam_item_id)
                  }
                >
                  <div className="flex flex-col items-center gap-0.5 w-full">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span className="whitespace-nowrap">
                        {t("inventory.actions.exchange")}
                      </span>
                    </div>
                    <span className="text-sm font-semibold break-words text-center leading-tight">
                      {formatCurrency(cs2bits_value)}
                    </span>
                  </div>
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
      withdrawMutation,
      exchangeItemMutation,
      getRarityGradient,
      getBorderColor,
    ]
  );

  /**
   * Enhanced empty state
   */
  const renderEmptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative mb-6">
          <Package
            className="h-20 w-20 text-muted-foreground/50"
            aria-hidden="true"
          />
          <div className="absolute -top-2 -right-2 bg-primary/20 rounded-full p-2">
            <Coins className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-3 text-foreground">
          {t("inventory.empty.title")}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
          {t("inventory.empty.description")}
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="hover:scale-105 transition-transform"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {t("inventory.empty.refresh")}
        </Button>
      </div>
    ),
    [t, refetch]
  );

  /**
   * Enhanced error state
   */
  const renderErrorState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle
          className="h-20 w-20 text-destructive mb-6"
          aria-hidden="true"
        />
        <h3 className="text-xl font-bold mb-3 text-foreground">
          {t("inventory.error.title")}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
          {t("inventory.error.description")}
        </p>
        <Button
          onClick={() => refetch()}
          variant="destructive"
          className="hover:scale-105 transition-transform"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          {t("inventory.error.retry")}
        </Button>
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
      className="space-y-8"
      aria-labelledby="inventory-heading"
      aria-live="polite"
      aria-busy={isLoading}
    >
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2
            id="inventory-heading"
            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
          >
            {t("inventory.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("inventory.subtitle")}
          </p>
        </div>

        {inventoryResponse?.success &&
          inventoryResponse.data &&
          inventoryResponse.data?.item_data.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Enhanced stats display */}
              <div className="text-right space-y-1">
                <div className="text-sm font-bold text-muted-foreground">
                  {t("inventory.itemCount", {
                    count: inventoryResponse.data.item_data.length,
                  })}
                </div>
                {/* <div className="font-bold text-xl text-primary flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-normal">
                    {t("inventory.totalValue")}
                  </span>
                  <Coins className="h-5 w-5" />
                  {formatCurrency(inventoryResponse.data.total_cs2bits_value)}
                </div> */}
              </div>

              {/* Enhanced exchange all button */}
              {availableItemsCount > 0 && (
                <Button
                  onClick={handleExchangeAll}
                  disabled={exchangeAllMutation.isPending}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 transition-all duration-200 shadow-lg h-auto min-h-[2.5rem] py-2"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      <span className="whitespace-nowrap">
                        {t("inventory.actions.exchangeAll")}
                      </span>
                    </div>
                    <span className="text-sm font-semibold break-words text-center">
                      {formatCurrency(
                        inventoryResponse.data.total_cs2bits_value
                      )}
                    </span>
                  </div>
                </Button>
              )}
            </div>
          )}
      </div>

      {/* Enhanced Content */}
      <div className="min-h-[500px]">
        {isLoading && renderSkeletonItems}

        {isError && renderErrorState}

        {inventoryResponse?.success &&
          inventoryResponse.data?.item_data.length === 0 &&
          renderEmptyState}

        {inventoryResponse?.success &&
          inventoryResponse.data &&
          inventoryResponse.data.item_data.length > 0 && (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
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
