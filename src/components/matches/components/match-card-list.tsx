"use client";

import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Gamepad2 } from "lucide-react";
import { MatchCard } from "./match-card";
import {
  match_player_stats,
  matches,
  stream_matches,
  streamers,
} from "@prisma-zod/generated/zod.schema";

interface MatchCardListProps {
  matchesData: Array<{
    stream_match: stream_matches;
    match: matches;
    match_player_stats: match_player_stats;
    streamer: streamers;
  }>;
  isLoading: boolean;
}

export function MatchCardList({ matchesData, isLoading }: MatchCardListProps) {
  const { t } = useTranslation();

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-12">
      <div className="relative">
        <Trophy className="h-16 w-16 text-muted-foreground/50" />
        <Gamepad2 className="h-8 w-8 text-muted-foreground/30 absolute -bottom-1 -right-1" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold">{t("matches.empty.title")}</h3>
        <p className="text-muted-foreground">
          {t("matches.empty.description")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("matches.empty.suggestion")}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (matchesData.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matchesData.map((data) => (
        <MatchCard key={data.stream_match.id} matchData={data} />
      ))}
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4 space-y-4">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Map skeleton */}
            <div className="flex items-center gap-2 text-sm">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Score and Round skeleton */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-6 w-8" />
              </div>

              {/* Enhanced Score Display skeleton */}
              <div className="flex items-center justify-center gap-3 font-mono text-center">
                <div className="flex items-baseline gap-1">
                  <Skeleton className="h-3 w-4" />
                  <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-6 w-2" />
                <div className="flex items-baseline gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-3 w-4" />
                </div>
              </div>
            </div>

            {/* Player Stats skeleton (randomly show/hide to simulate finished/live matches) */}
            {index % 2 === 0 && (
              <div className="grid grid-cols-3 gap-3 text-center border-t pt-3">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-8 mx-auto" />
                  <Skeleton className="h-4 w-6 mx-auto" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-8 mx-auto" />
                  <Skeleton className="h-4 w-6 mx-auto" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-8 mx-auto" />
                  <Skeleton className="h-4 w-6 mx-auto" />
                </div>
              </div>
            )}

            {/* Time skeleton */}
            <div className="flex items-center gap-2 text-xs bg-muted/30 px-2 py-1 rounded">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
