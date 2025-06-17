"use client";

import { useTranslation } from "react-i18next";
import { Trophy } from "lucide-react";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RaffleWithSteamItem } from "@/actions/raffles/get-all-raffles-action";

interface ClosedRaffleItemProps {
  raffle: RaffleWithSteamItem;
}

export function ClosedRaffleItem({ raffle }: ClosedRaffleItemProps) {
  const { t } = useTranslation();

  // Determine the exterior color class based on the skin's exterior
  const getExteriorColorClass = () => {
    const item_type = raffle.steam_item.item_type;
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
  };

  return (
    <Card className="transition-all hover:shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 flex-shrink-0 rounded overflow-hidden">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${getExteriorColorClass()} z-0`}
            ></div>
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

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">
              {raffle.steam_item.market_hash_name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Trophy className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-muted-foreground truncate">
                {t("raffle.winner")}: {raffle.winner?.username}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t("raffle.drawn_on")}{" "}
              {formatRelative(raffle.drawn_at!, new Date(), { locale: ptBR })}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <Badge variant="outline" className="text-xs">
              {t("raffle.closed")}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
