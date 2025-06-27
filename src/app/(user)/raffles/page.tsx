"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Ticket, Trophy } from "lucide-react";

import { getAllRafflesAction } from "@/actions/raffles/get-all-raffles-action";
import { RaffleCard } from "@/components/raffles/raffle-card";
import { ClosedRaffleItem } from "@/components/raffles/closed-raffle-item";
import {
  RaffleCardSkeleton,
  ClosedRaffleItemSkeleton,
} from "@/components/raffles/raffle-skeleton";
import { getUserBalanceAction } from "@/actions/user/get-user-balance-action";
import { CheckUserProfile } from "@/components/profile/check-user-profile";
import { raffle_status_schema } from "@prisma-zod/generated/zod.schema";

export default function RafflesPage() {
  const { t } = useTranslation();
  const [expandedRaffleId, setExpandedRaffleId] = useState<string | null>(null);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["raffles"],
    queryFn: getAllRafflesAction,
  });

  const { data: balanceResponse } = useQuery({
    queryKey: ["userBalance"],
    queryFn: getUserBalanceAction,
    refetchOnWindowFocus: false,
  });

  const handleToggleExpansion = (raffleId: string) => {
    // Only allow one card to be expanded at a time
    setExpandedRaffleId(expandedRaffleId === raffleId ? null : raffleId);
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="gaming-slide-up">
          <div className="gaming-card flex flex-col items-center justify-center py-16 px-6 text-center">
            <h1 className="gaming-text-primary text-2xl font-bold mb-4">
              {t("raffle.error_title")}
            </h1>
            <p className="gaming-text-secondary">{t("raffle.error_message")}</p>
          </div>
        </div>
      </div>
    );
  }

  const raffles = response?.data || [];
  const activeRaffles = raffles
    .filter((raffle) => raffle.status === raffle_status_schema.Enum.active)
    .slice(0, 3);
  const closedRaffles = raffles
    .filter(
      (raffle) =>
        raffle.status === raffle_status_schema.Enum.closed ||
        raffle.status === raffle_status_schema.Enum.delivered
    )
    .sort(
      (a, b) =>
        new Date(b.drawn_at!).getTime() - new Date(a.drawn_at!).getTime()
    );

  return (
    <>
      <CheckUserProfile />
      <div className="container mx-auto px-4 py-8">
        {/* Header with gaming animation */}
        <div className="gaming-slide-up mb-8">
          <h1 className="gaming-text-primary text-4xl font-bold mb-2">
            {t("raffle.title", "Active Raffles")}
          </h1>
          <p className="gaming-text-secondary text-lg">
            {t("raffle.subtitle", "Win amazing CS2 skins and items")}
          </p>
        </div>

        {/* Gaming divider */}
        <div className="gaming-divider mb-8"></div>

        {/* Active Raffles */}
        <section className="mb-12">
          <div className="gaming-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="gaming-slide-up"
                      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                    >
                      <RaffleCardSkeleton />
                    </div>
                  ))
                : activeRaffles.length > 0
                  ? activeRaffles.map((raffle, index) => (
                      <div
                        key={raffle.id}
                        className="gaming-slide-up"
                        style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                      >
                        <RaffleCard
                          userBalance={balanceResponse?.data}
                          raffle={raffle}
                          isExpanded={expandedRaffleId === raffle.id}
                          onToggleExpansion={handleToggleExpansion}
                        />
                      </div>
                    ))
                  : null}
            </div>
          </div>

          {!isLoading && activeRaffles.length === 0 && (
            <div className="gaming-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="gaming-card flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="bg-primary/10 rounded-full p-6 mb-4 gaming-pulse">
                  <Ticket className="h-12 w-12 text-primary" />
                </div>
                <h3 className="gaming-text-accent text-xl font-bold mb-2">
                  {t("raffle.no_active_raffles_title")}
                </h3>
                <p className="gaming-text-secondary text-center max-w-md">
                  {t("raffle.no_active_raffles")}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Gaming divider */}
        <div className="gaming-divider mb-8"></div>

        {/* Recent Results */}
        <section>
          <div className="gaming-slide-up" style={{ animationDelay: "0.3s" }}>
            <h2 className="gaming-text-primary text-2xl font-bold mb-6">
              {t("raffle.recent_results")}
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="gaming-slide-up"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <ClosedRaffleItemSkeleton />
                </div>
              ))}
            </div>
          ) : closedRaffles.length > 0 ? (
            <div className="space-y-4">
              {closedRaffles.map((raffle, index) => (
                <div
                  key={raffle.id}
                  className="gaming-slide-up"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <ClosedRaffleItem raffle={raffle} />
                </div>
              ))}
            </div>
          ) : (
            <div className="gaming-slide-up" style={{ animationDelay: "0.4s" }}>
              <div className="gaming-card flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="bg-primary/10 rounded-full p-6 mb-4 gaming-pulse">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
                <h3 className="gaming-text-accent text-xl font-bold mb-2">
                  {t("raffle.no_recent_results_title")}
                </h3>
                <p className="gaming-text-secondary text-center max-w-md">
                  {t("raffle.no_recent_results")}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
