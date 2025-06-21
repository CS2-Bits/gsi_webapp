import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Clock,
  Crosshair,
  Flame,
  Handshake,
  Skull,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMapName } from "@/types/map-name";
import { useTranslation } from "react-i18next";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { match_status } from "@prisma/client";
import {
  match_player_stats,
  matches,
  streamers,
} from "@prisma-zod/generated/zod.schema";
interface MatchHeaderProps {
  streamer: streamers;
  matchData: matches | null;
  statsData: match_player_stats | null;
}

export function MatchHeader({
  streamer,
  matchData,
  statsData,
}: MatchHeaderProps) {
  const { t } = useTranslation();

  // Calculate KDA ratio
  const calculateKDA = () => {
    if (!statsData) return 0;

    const kills = statsData.kills || 0;
    const deaths = statsData.deaths || 0;
    const assists = statsData.assists || 0;

    // Avoid division by zero
    if (deaths === 0) return kills + assists > 0 ? "∞" : "0.00";

    const kda = (kills + assists) / deaths;
    return kda.toFixed(2);
  };

  return (
    <div className="space-y-4">
      <div className="gaming-card rounded-lg border bg-card/50 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Streamer Info and Score */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 sm:h-15 sm:w-15">
                <Avatar>
                  <AvatarImage
                    src={streamer.avatar_url || ""}
                    className="rounded-full p-1"
                  />
                  <AvatarFallback className="bg-transparent">
                    {streamer.username_id.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-xl sm:text-2xl font-bold gaming-text-accent">
                {streamer.display_name || streamer.username_id}
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              {matchData ? (
                <Badge variant="destructive" className="self-end font-bold">
                  {matchData.status_name == match_status.Abandoned ||
                  matchData.status_name == match_status.Invalid
                    ? t("match.status." + matchData.status_name)
                    : t("match.status." + matchData.phase_name)}
                </Badge>
              ) : (
                <Badge variant="destructive" className="self-end font-bold">
                  {t("match.offline")}
                </Badge>
              )}
              <div className="text-3xl sm:text-4xl font-mono font-bold gaming-text-primary p-1">
                {statsData ? (
                  <div className="flex items-center gap-2 relative justify-end">
                    <div
                      className={cn(
                        "p-1 rounded-md",
                        statsData.team_side_name === "CT" && "relative"
                      )}
                    >
                      <span className="text-chart-2">
                        {statsData.ct_score.toString().padStart(2, "0")}
                      </span>
                      {statsData.team_side_name === "CT" && (
                        <div className="absolute inset-0 rounded-md border-2 border-chart-2 animate-pulse pointer-events-none" />
                      )}
                    </div>
                    <span className="gaming-text-accent">-</span>
                    <div
                      className={cn(
                        "p-1 rounded-md",
                        statsData.team_side_name === "T" && "relative"
                      )}
                    >
                      <span className="text-chart-1">
                        {statsData.t_score.toString().padStart(2, "0")}
                      </span>
                      {statsData.team_side_name === "T" && (
                        <div className="absolute inset-0 rounded-md border-2 border-chart-1 animate-pulse pointer-events-none" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-end">
                    <Skeleton className="gaming-skeleton h-8 w-8 sm:h-10 sm:w-10" />
                    <span className="gaming-text-accent">-</span>
                    <Skeleton className="gaming-skeleton h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid - Now 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Combined KDA Stats */}
            <div className="gaming-card p-3 rounded-md border bg-muted/10">
              {statsData ? (
                <div className="flex justify-around items-end">
                  <ItemMatchStats
                    icon={<Crosshair className="text-red-500 mb-1" size={23} />}
                    label={t("match.kills")}
                    value={
                      <span className="font-medium gaming-text-accent">
                        {statsData.kills || 0}
                      </span>
                    }
                  />
                  <ItemMatchStats
                    icon={<Skull className="text-gray-500 mb-1" size={23} />}
                    label={t("match.deaths")}
                    value={
                      <span className="font-medium gaming-text-accent">
                        {statsData.deaths || 0}
                      </span>
                    }
                  />
                  <ItemMatchStats
                    icon={
                      <Handshake className="text-blue-500 mb-1" size={23} />
                    }
                    label={t("match.assists")}
                    value={
                      <span className="font-medium gaming-text-accent">
                        {statsData.assists || 0}
                      </span>
                    }
                  />
                  <ItemMatchStats
                    icon={
                      <BarChart className="text-green-500 mb-1" size={23} />
                    }
                    label={t("match.kda")}
                    value={
                      <span className="font-medium font-mono gaming-text-primary">
                        {calculateKDA()}
                      </span>
                    }
                  />
                </div>
              ) : (
                <div className="flex justify-around items-end">
                  <ItemMatchStats
                    icon={<Crosshair className="text-red-500 mb-1" size={23} />}
                    label={t("match.kills")}
                    value={<Skeleton className="gaming-skeleton h-6 w-10" />}
                  />
                  <ItemMatchStats
                    icon={<Skull className="text-gray-500 mb-1" size={23} />}
                    label={t("match.deaths")}
                    value={<Skeleton className="gaming-skeleton h-6 w-10" />}
                  />
                  <ItemMatchStats
                    icon={
                      <Handshake className="text-blue-500 mb-1" size={23} />
                    }
                    label={t("match.assists")}
                    value={<Skeleton className="gaming-skeleton h-6 w-10" />}
                  />
                  <ItemMatchStats
                    icon={
                      <BarChart className="text-green-500 mb-1" size={23} />
                    }
                    label={t("match.kda")}
                    value={<Skeleton className="gaming-skeleton h-6 w-12" />}
                  />
                </div>
              )}
            </div>

            {/* Combined Duration and Map */}
            <div className="gaming-card p-3 rounded-md border bg-muted/10">
              {matchData ? (
                <div className="flex justify-around items-end">
                  <ItemMatchStats
                    icon={<Target className="text-purple-500" size={23} />}
                    label={t("match.map")}
                    value={
                      <span className="font-medium gaming-text-accent">
                        {formatMapName(matchData.map_name)}
                      </span>
                    }
                  />
                  <ItemMatchStats
                    icon={<Flame className="text-purple-500" size={23} />}
                    label={t("match.rounds_name")}
                    value={
                      <span className="font-medium gaming-text-accent">
                        {statsData?.round || 0}
                      </span>
                    }
                  />
                  <ItemMatchStats
                    icon={<Clock className="text-orange-500" size={23} />}
                    label={t("match.duration")}
                    value={
                      <span className="font-medium gaming-text-accent">
                        {formatDistance(
                          matchData.started_at,
                          matchData.ended_at || new Date(),
                          { locale: ptBR }
                        )}
                      </span>
                    }
                  />
                </div>
              ) : (
                <div className="flex justify-around items-end">
                  <ItemMatchStats
                    icon={<Target className="text-purple-500" size={23} />}
                    label={t("match.map")}
                    value={<Skeleton className="gaming-skeleton h-6 w-20" />}
                  />
                  <ItemMatchStats
                    icon={<Flame className="text-purple-500" size={23} />}
                    label={t("match.rounds_name")}
                    value={<Skeleton className="gaming-skeleton h-6 w-20" />}
                  />
                  <ItemMatchStats
                    icon={<Clock className="text-orange-500" size={23} />}
                    label={t("match.duration")}
                    value={<Skeleton className="gaming-skeleton h-6 w-20" />}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemMatchStats({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-1 mb-1">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {value}
    </div>
  );
}
