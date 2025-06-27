"use client";

import { useTranslation } from "react-i18next";
import Image from "next/image";
import { format } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ptBR } from "date-fns/locale";
import { RaffleWithSteamItem } from "@/actions/raffles/get-all-raffles-action";
import { getRarityGradient } from "@/lib/utils";

interface ClosedRaffleItemProps {
  raffle: RaffleWithSteamItem;
}

export function ClosedRaffleItem({ raffle }: ClosedRaffleItemProps) {
  const { t } = useTranslation();

  return (
    <Card className="gaming-card gaming-card-interactive">
      <CardContent className="p-3">
        <div className="flex items-center gap-4">
          {/* Item Image */}
          <div
            className={`relative w-14 h-14 rounded overflow-hidden bg-gradient-to-br ${getRarityGradient(raffle.steam_item.item_type)} flex-shrink-0`}
          >
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Image
                src={
                  raffle.steam_item.image_url ||
                  "/CS2Bits-icon.png?height=64&width=64"
                }
                alt={raffle.steam_item.market_hash_name}
                width={48}
                height={48}
                className="object-contain drop-shadow-sm"
                crossOrigin="anonymous"
              />
            </div>
          </div>

          {/* Item Info */}
          <div className="flex-1 min-w-0">
            <h3 className="gaming-text-accent font-medium text-base mb-1 truncate">
              {raffle.steam_item.market_hash_name}
            </h3>
            <p className="gaming-text-secondary text-sm mb-1">
              {t("raffle.drawn_on", {
                date: format(new Date(raffle.drawn_at!), "dd/MM/yyyy", {
                  locale: ptBR,
                }),
              })}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Badge
                variant="secondary"
                className="gaming-badge text-sm px-2 py-0.5"
              >
                {raffle.steam_item.item_type}
              </Badge>
            </div>
          </div>

          {/* Winner Info */}
          <div className="text-right flex-shrink-0">
            <p className="gaming-text-secondary text-sm mb-1">
              {t("raffle.winner")}
            </p>
            <div className="gaming-text-primary font-semibold text-base">
              {raffle.winner?.username || t("raffle.drawing_winner")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
