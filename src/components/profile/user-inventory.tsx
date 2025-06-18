"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useEffect, useState, useCallback, useMemo } from "react";
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

/**
 * UserInventory Component
 *
 * Displays the authenticated user's CS2 inventory items from user_inventory_items
 * with expiration tracking, withdrawal and exchange functionality.
 *
 * Features:
 * - Responsive grid layout (mobile-first)
 * - Expiration status with Brazilian locale
 * - Item withdrawal and CS2Bits exchange
 * - Bulk exchange functionality
 * - Accessibility compliant with ARIA attributes
 * - Internationalization support
 */
export default function UserInventory() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
    onSuccess: (data, steamItemId) => {
      if (data.success) {
        toast(t("inventory.withdraw.success.title"));
        queryClient.invalidateQueries({ queryKey: ["user-inventory"] });
      } else {
        toast(t("inventory.withdraw.error.title"));
      }
    },
    onError: (error) => {
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
        setSelectedItems([]);
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
   * Format currency value with proper locale formatting
   */
  const formatCurrency = useCallback(
    (value: number, currency = "USD"): string => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(value);
    },
    []
  );

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
        timeText: formatDistanceToNow(expiresIn, {
          locale: ptBR,
          addSuffix: true,
        }),
      };
    },
    [t]
  );

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
   * Render skeleton loader for inventory items
   */
  const renderSkeletonItems = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-32 w-full rounded-md animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-3/4 animate-pulse" />
              <Skeleton className="h-3 w-1/2 animate-pulse" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-16 animate-pulse" />
                <Skeleton className="h-5 w-20 animate-pulse" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 animate-pulse" />
                <Skeleton className="h-8 flex-1 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    []
  );

  /**
   * Render individual inventory item card
   */
  const renderInventoryItem = useCallback(
    (item: user_inventory_items, steamItem: steam_items) => {
      const expirationStatus = getExpirationStatus(item.expires_in);
      const isExpired = isPast(item.expires_in);
      const isDisabled = item.in_trade || isExpired;

      return (
        <Card
          key={`${item.user_id}-${item.steam_item_id}`}
          className={`overflow-hidden hover:shadow-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
            isDisabled ? "opacity-60" : ""
          }`}
          tabIndex={0}
          role="article"
          aria-label={t("inventory.item.ariaLabel", {
            name: steamItem.market_hash_name,
          })}
        >
          <CardHeader className="pb-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
              {steamItem.image_url ? (
                <Image
                  src={steamItem.image_url || "/placeholder.svg"}
                  alt={steamItem.market_hash_name}
                  fill
                  className="object-cover transition-transform duration-200 hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package
                    className="h-12 w-12 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
              )}

              {/* Expiration overlay for expired items */}
              {isExpired && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
              {steamItem.market_hash_name}
            </CardTitle>

            <p className="text-xs text-muted-foreground capitalize">
              {steamItem.item_type.replace("_", " ")}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">
                {formatCurrency(
                  steamItem.estimated_fiat_value,
                  steamItem.currency
                )}
              </span>

              <div
                className="flex gap-1"
                role="group"
                aria-label={t("inventory.item.status")}
              >
                {item.in_trade && (
                  <Badge variant="secondary" className="text-xs">
                    {t("inventory.badges.inTrade")}
                  </Badge>
                )}

                <Badge
                  variant={expirationStatus.variant}
                  className="text-xs flex items-center gap-1"
                  title={expirationStatus.timeText}
                >
                  <expirationStatus.icon className="h-3 w-3" />
                  {expirationStatus.text}
                </Badge>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                disabled={isDisabled || withdrawMutation.isPending}
                onClick={() => withdrawMutation.mutate(item.steam_item_id)}
              >
                <Download className="h-3 w-3 mr-1" />
                {t("inventory.actions.withdraw")}
              </Button>

              <Button
                size="sm"
                variant="default"
                className="flex-1 text-xs"
                disabled={isDisabled || exchangeItemMutation.isPending}
                onClick={() => exchangeItemMutation.mutate(item.steam_item_id)}
              >
                <Coins className="h-3 w-3 mr-1" />
                {t("inventory.actions.exchange")}
              </Button>
            </div>

            {/* Expiration time */}
            <p className="text-xs text-muted-foreground text-center">
              {expirationStatus.timeText}
            </p>
          </CardContent>
        </Card>
      );
    },
    [
      t,
      getExpirationStatus,
      formatCurrency,
      withdrawMutation,
      exchangeItemMutation,
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
                    {inventoryResponse.data.total_cs2bits_value} CS2Bits
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              role="grid"
              aria-label={t("inventory.grid.ariaLabel")}
            >
              {inventoryResponse.data?.item_data.map((i) =>
                renderInventoryItem(i.inventoty_item, i.steam_item)
              )}
            </div>
          )}
      </div>
    </section>
  );
}
