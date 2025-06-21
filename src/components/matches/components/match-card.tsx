"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MapPin, Target } from "lucide-react";
import { stream_match_status } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  match_player_stats,
  matches,
  stream_matches,
  streamers,
} from "@prisma-zod/generated/zod.schema";

interface MatchCardProps {
  matchData: {
    stream_match: stream_matches;
    match: matches;
    match_player_stats: match_player_stats;
    streamer: streamers;
  };
}

export function MatchCard({ matchData }: MatchCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleCardClick = () => {
    if (matchData.stream_match.match_status === stream_match_status.Live) {
      router.push(`/${matchData.streamer.username_id}`);
    } else {
      router.push(`/matches/${matchData.stream_match.id}`);
    }
  };

  const getStatusBadge = (status: stream_match_status) => {
    switch (status) {
      case stream_match_status.Live:
        return (
          <Badge
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
            {t("matches.status.live")}
          </Badge>
        );
      case stream_match_status.Finished:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            {t("matches.status.finished")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const relativeTime = formatDistanceToNow(
    new Date(matchData.stream_match.created_at),
    {
      addSuffix: true,
      locale: ptBR,
    }
  );
  const isLive =
    matchData.stream_match.match_status === stream_match_status.Live;

  return (
    <Card
      className="gaming-card gaming-card-interactive cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] group border-border/50 hover:border-primary/50"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header with Streamer and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 gaming-slide-in">
              <AvatarImage
                src={matchData.streamer.avatar_url ?? undefined}
                alt={matchData.streamer.username_id}
              />
              <AvatarFallback className="gaming-text-accent bg-primary/10">
                {matchData.streamer.username_id.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="gaming-text-accent font-semibold text-base group-hover:text-primary transition-colors">
                {matchData.streamer.username_id}
              </h3>
              <p className="gaming-text-secondary text-sm">
                {isLive
                  ? t("matches.card.streaming")
                  : t("matches.card.streamed")}
              </p>
            </div>
          </div>
          {getStatusBadge(matchData.stream_match.match_status)}
        </div>

        {/* Map Information */}
        <div className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="gaming-text-accent font-mono font-medium">
            {matchData.match.map_name}
          </span>
        </div>

        {/* Score and Round */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="gaming-text-secondary text-base">
                {t("matches.card.round")}
              </span>
            </div>
            <span className="gaming-text-primary font-mono font-bold text-lg">
              {matchData.match_player_stats.round}
            </span>
          </div>

          {/* Enhanced Score Display */}
          <div className="flex items-center justify-center gap-3 font-mono text-center gaming-card bg-background/50 rounded-lg p-2">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-medium text-blue-400 gaming-text-shimmer">
                CT
              </span>
              <span className="text-2xl font-bold text-blue-400">
                {matchData.match_player_stats.ct_score
                  .toString()
                  .padStart(2, "0")}
              </span>
            </div>
            <span className="text-xl font-bold gaming-text-primary">-</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-orange-400">
                {matchData.match_player_stats.t_score
                  .toString()
                  .padStart(2, "0")}
              </span>
              <span className="text-sm font-medium text-orange-400 gaming-text-shimmer">
                T
              </span>
            </div>
          </div>
        </div>

        {/* Player Stats (for finished matches) */}
        {!isLive && (
          <div className="grid grid-cols-3 gap-3 text-center border-t pt-3">
            <div className="space-y-1">
              <div className="text-sm gaming-text-secondary font-medium">
                {t("matches.card.kills")}
              </div>
              <div className="text-base font-bold text-green-600">
                {matchData.match_player_stats.kills}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm gaming-text-secondary font-medium">
                {t("matches.card.deaths")}
              </div>
              <div className="text-base font-bold text-red-600">
                {matchData.match_player_stats.deaths}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm gaming-text-secondary font-medium">
                {t("matches.card.assists")}
              </div>
              <div className="text-base font-bold text-blue-600">
                {matchData.match_player_stats.assists}
              </div>
            </div>
          </div>
        )}

        {/* Time Information */}
        <div className="flex items-center gap-2 text-sm gaming-text-secondary bg-muted/30 px-2 py-1 rounded">
          <Clock className="h-3 w-3" />
          <span>{relativeTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}
