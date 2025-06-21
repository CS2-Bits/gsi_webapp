import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Star,
  Skull,
  Target,
  Shield,
  Swords,
  Clock,
  DollarSign,
  Heart,
  Bomb,
} from "lucide-react";
import { TFunction } from "i18next";
import { formatDuration, intervalToDuration } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LucideIcon } from "lucide-react";
import {
  match_player_rounds,
  streamers,
} from "@prisma-zod/generated/zod.schema";

interface RoundListProps {
  rounds: match_player_rounds[];
  streamer: streamers;
  t: TFunction<"translation", undefined>;
}

function getRoundConclusionInfo(conclusionName: string | null, t: TFunction) {
  if (!conclusionName)
    return {
      icon: Clock,
      color: "text-muted-foreground",
      label: "Em andamento",
    };
  const conclusionMap: Record<
    string,
    { icon: LucideIcon; color: string; label: string }
  > = {
    ct_win_defuse: {
      icon: Shield,
      color: "text-blue-500",
      label: t("match.rounds.ct_win_defuse"),
    },
    t_win_bomb: {
      icon: Bomb,
      color: "text-orange-500",
      label: t("match.rounds.t_win_bomb"),
    },
    ct_win_time: {
      icon: Shield,
      color: "text-blue-500",
      label: t("match.rounds.ct_win_time"),
    },
    ct_win_elimination: {
      icon: Shield,
      color: "text-blue-500",
      label: t("match.rounds.ct_win_elimination"),
    },
    t_win_elimination: {
      icon: Swords,
      color: "text-yellow-500",
      label: t("match.rounds.t_win_elimination"),
    },
    t_win_time: {
      icon: Swords,
      color: "text-yellow-500",
      label: t("match.rounds.t_win_time"),
    },
  };

  return (
    conclusionMap[conclusionName] || {
      icon: Star,
      color: "text-primary",
      label: conclusionName,
    }
  );
}

export function RoundList({ rounds, streamer, t }: RoundListProps) {
  return (
    <Card className="overflow-hidden gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame size={18} className="text-primary" />
          {t("match.rounds.rounds_live")}
        </CardTitle>
        <CardDescription>
          {t("match.rounds.rounds_live_description", {
            streamer: streamer.display_name || streamer.username_id,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {rounds.map((round) => {
          const {
            icon: ConclusionIcon,
            color,
            label,
          } = getRoundConclusionInfo(round.round_conclusion_name || null, t);

          return (
            <div
              key={round.round_number}
              className={`relative flex flex-col gap-2 p-4 rounded-lg border transition-all ${
                round.round_conclusion_name
                  ? "bg-primary/5 border-primary/20"
                  : "hover:bg-accent/50"
              }`}
            >
              {/* Time display */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={14} />
                {formatDuration(
                  intervalToDuration({
                    start: round.created_at,
                    end: round.updated_at,
                  }),
                  {
                    locale: ptBR,
                    format: ["minutes", "seconds"],
                  }
                )}
              </div>

              {/* Round header */}
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  className={`px-2 py-0.5 ${
                    round.team_side_name === "CT"
                      ? "bg-chart-2 text-chart-2-foreground"
                      : "bg-chart-1 text-chart-1-foreground"
                  }`}
                >
                  {round.team_side_name === "CT" ? (
                    <Shield className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <Swords className="h-3.5 w-3.5 mr-1" />
                  )}
                  Round {round.round_number}
                </Badge>

                <div className="flex-1" />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                <div className="flex items-center gap-2 bg-background/80 p-2 rounded-md">
                  <Skull className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">{round.kills}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("match.kills")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-background/80 p-2 rounded-md">
                  <Target className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">{round.hs_kills}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("match.rounds.headshots")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-background/80 p-2 rounded-md">
                  <Heart className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{round.health}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("match.rounds.round_health")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-background/80 p-2 rounded-md">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">
                      ${round.equipment_val}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("match.rounds.round_equipment")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Round events */}
              {(round.kills > 0 ||
                round.hs_kills > 0 ||
                round.equipment_val > 3000 ||
                round.health < 30 ||
                round.round_conclusion_name) && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs font-medium mb-1.5">
                    {t("match.rounds.round_events")}
                  </p>
                  <div className="space-y-1.5">
                    {round.hs_kills > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <Target className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-muted-foreground">
                          {round.hs_kills}{" "}
                          {round.hs_kills === 1
                            ? t("match.rounds.headshot")
                            : t("match.rounds.headshots")}{" "}
                          de {round.kills} {t("match.kills")}
                        </span>
                      </div>
                    )}

                    {round.equipment_val > 3000 && (
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-muted-foreground">
                          {t("match.rounds.round_high_equipment")} ($
                          {round.equipment_val})
                        </span>
                      </div>
                    )}

                    {round.health < 30 && round.health > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <Heart className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-muted-foreground">
                          {t("match.rounds.round_survived", {
                            health: round.health,
                          })}
                        </span>
                      </div>
                    )}

                    {round.round_conclusion_name && (
                      <div className="flex items-center gap-2 text-xs">
                        <ConclusionIcon className={`h-3.5 w-3.5 ${color}`} />
                        <span className="text-muted-foreground">
                          {t("match.rounds.round_finished", {
                            label,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {rounds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
            <p className="text-muted-foreground">
              {t("match.rounds.rounds_waiting")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("match.rounds.rounds_waiting_description")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
