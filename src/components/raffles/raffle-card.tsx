"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Clock, Ticket, Minus, Plus, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { purchaseTicketsAction } from "@/actions/raffles/purchase-tickets-action";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RaffleWithSteamItem } from "@/actions/raffles/get-all-raffles-action";
import { user_balances } from "@prisma-zod/generated/zod.schema";
import { getRarityGradient } from "@/lib/utils";

interface RaffleCardProps {
  raffle: RaffleWithSteamItem;
  userBalance?: user_balances; // Optional prop for user balance
  isExpanded: boolean;
  onToggleExpansion: (raffleId: string) => void;
}

export function RaffleCard({
  raffle,
  isExpanded,
  userBalance,
  onToggleExpansion,
}: RaffleCardProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const expandedContentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: purchaseTicketsAction,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t("purchase.success"), {
          description: t("purchase.tickets_purchased", { count: quantity }),
        });
        queryClient.invalidateQueries({ queryKey: ["raffles"] });
        queryClient.invalidateQueries({ queryKey: ["userBalance"] });
        onToggleExpansion(raffle.id);
        setQuantity(1);
      } else {
        toast.error(t("purchase.failed"), {
          description: response.error_message || t("purchase.unknown_error"),
        });
      }
    },
    onError: () => {
      toast.error(t("purchase.failed"), {
        description: t("purchase.unknown_error"),
      });
    },
  });

  // Calculate the height of expanded content for smooth animation
  useEffect(() => {
    if (expandedContentRef.current && isExpanded) {
      const height = expandedContentRef.current.scrollHeight;
      setExpandedHeight(height);
    } else {
      setExpandedHeight(0);
    }
  }, [isExpanded, quantity]);

  const ticketPrice = raffle.ticket_price;
  const totalPrice = quantity * ticketPrice;
  const currentBalance = userBalance?.balance || 0;
  const canPurchase = quantity >= 1 && currentBalance >= totalPrice;

  const handlePurchase = () => {
    if (!canPurchase) return;
    purchaseMutation.mutate({
      raffle_id: raffle.id,
      quantity,
    });
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleToggle = () => {
    onToggleExpansion(raffle.id);
    if (!isExpanded) {
      setQuantity(1); // Reset quantity when opening
    }
  };

  // Determine the exterior color class based on the skin's exterior/rarity

  return (
    <Card
      className={`gaming-card gaming-card-interactive overflow-hidden h-full transition-all duration-300 border-2 ${
        isExpanded ? "shadow-lg gaming-glow" : "hover:shadow-md"
      }`}
      style={{
        borderColor: raffle.steam_item.item_type.includes("Contraband")
          ? "#ef9e1f"
          : raffle.steam_item.item_type.includes("Covert")
            ? "#eb4b4b"
            : raffle.steam_item.item_type.includes("Classified")
              ? "#d32be3"
              : raffle.steam_item.item_type.includes("Restricted")
                ? "#8a43fa"
                : raffle.steam_item.item_type.includes("Mil-Spec")
                  ? "#4a6afa"
                  : raffle.steam_item.item_type.includes("Industrial")
                    ? "#5a9ada"
                    : "#b0c2da",
      }}
    >
      {/* Card Content with Image and Info */}
      <CardContent className="p-0 flex flex-col">
        {/* Image Section with Rarity Gradient Background */}
        <div className="relative w-full h-32 overflow-hidden rounded-lg">
          {/* Base background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-muted/80"></div>

          {/* Rarity gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getRarityGradient(raffle.steam_item.item_type)}`}
          ></div>

          {/* Subtle pattern overlay for texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] opacity-30"></div>

          {/* Image container */}
          <div className="absolute inset-0 flex items-center justify-center p-3 z-10">
            <Image
              src={
                raffle.steam_item.image_url ||
                "/CS2Bits-icon.png?height=200&width=200"
              }
              alt={raffle.steam_item.market_hash_name}
              width={160}
              height={120}
              className="object-contain max-h-28 drop-shadow-lg filter brightness-105"
              crossOrigin="anonymous"
            />
          </div>

          {/* Type badge with better visibility */}
          <Badge className="absolute top-2 right-2 z-20 gaming-badge">
            {raffle.steam_item.item_type}
          </Badge>
        </div>

        {/* Info Section - Fixed content that doesn't expand */}
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="gaming-text-accent font-medium text-base mb-1 line-clamp-1">
            {raffle.steam_item.market_hash_name}
          </h3>

          <div className="mt-auto space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="gaming-text-secondary text-base">
                {t("raffle.ticket_price")}
              </span>
              <span className="gaming-text-primary text-base font-semibold">
                {raffle.ticket_price} {t("common.points")}
              </span>
            </div>

            <div className="flex items-center gap-1 text-base gaming-text-secondary">
              <Clock className="h-3 w-3" />
              <span>
                {t("raffle.ends_on")}{" "}
                {formatDistanceToNow(raffle.end_at, { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Card Footer - Fixed content that doesn't expand */}
      <CardFooter className="p-3 pt-0">
        <Button
          className={`w-full transition-all duration-200 ${!isExpanded ? "gaming-button text-foreground font-semibold" : ""}`}
          onClick={handleToggle}
          size="sm"
          variant={isExpanded ? "outline" : "default"}
        >
          {isExpanded ? (
            <>
              <X className="h-4 w-4 mr-1.5" />
              {t("common.cancel")}
            </>
          ) : (
            <>
              <Ticket className="h-4 w-4 mr-1.5" />
              {t("raffle.buy_tickets")}
            </>
          )}
        </Button>
      </CardFooter>

      {/* Purchase Expansion - Only expands below the button */}
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          height: isExpanded ? `${expandedHeight}px` : "0px",
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div ref={expandedContentRef} className="px-3 pb-3">
          <Separator className="mb-3" />

          {/* Balance and Price Info */}
          <div className="gaming-card bg-muted/30 backdrop-blur-sm rounded-lg p-2.5 mb-3 space-y-1.5 border border-border/50">
            <div className="flex justify-between text-sm">
              <span className="gaming-text-secondary">
                {t("purchase.ticket_price")}
              </span>
              <span className="gaming-text-accent font-medium">
                {ticketPrice} {t("common.points")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="gaming-text-secondary">
                {t("purchase.balance")}
              </span>
              <span className="gaming-text-primary font-medium">
                {Number(currentBalance)} {t("common.points")}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-3">
            <label className="gaming-text-accent text-sm font-medium mb-1.5 block">
              {t("purchase.quantity")}
            </label>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full transition-all duration-200 hover:scale-105 gaming-button"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                aria-label={t("purchase.decrease_quantity")}
              >
                <Minus className="h-3 w-3" />
              </Button>

              <div className="gaming-card bg-background border rounded-lg px-3 py-1.5 min-w-[2.5rem] text-center font-semibold text-base shadow-sm">
                {quantity}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full transition-all duration-200 hover:scale-105 gaming-button"
                onClick={incrementQuantity}
                aria-label={t("purchase.increase_quantity")}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Total Cost */}
          <div className="gaming-card bg-primary/5 border border-primary/20 rounded-lg p-2.5 mb-3 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="gaming-text-secondary text-sm font-medium">
                {t("purchase.total")}
              </span>
              <span className="gaming-text-primary text-base font-bold">
                {totalPrice} {t("common.points")}
              </span>
            </div>
          </div>

          {/* Insufficient Balance Warning */}
          {!canPurchase && currentBalance < totalPrice && (
            <div className="gaming-card bg-destructive/10 border border-destructive/20 rounded-lg p-2.5 mb-3 backdrop-blur-sm">
              <p className="text-sm text-destructive font-medium">
                {t("purchase.insufficient_balance")}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-sm py-2 transition-all duration-200 hover:bg-muted"
              onClick={handleToggle}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="flex-1 text-sm py-2 gaming-button text-foreground transition-all duration-200 hover:shadow-md"
              onClick={handlePurchase}
              disabled={!canPurchase || purchaseMutation.isPending}
              aria-busy={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending
                ? t("purchase.processing")
                : t("purchase.confirm_purchase")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
