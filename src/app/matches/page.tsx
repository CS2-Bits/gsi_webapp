"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { stream_match_status } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StreamMatchFilters } from "@/components/matches/components/match-filters";
import { MatchCardList } from "@/components/matches/components/match-card-list";
import { getMatchesAction } from "@/actions/matches/get-matches-action";
import { getMatchesStreamersAction } from "@/actions/matches/get-matches-streamers-action";
import { MatchFilters } from "@/schemas/match_filters.schema";

export default function MatchesPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<MatchFilters>({
    status: stream_match_status.Live,
    page: 1,
    limit: 10,
  });

  // Fetch matches with current filters
  const {
    data: pageData,
    isLoading: isLoadingMatches,
    error: matchesError,
  } = useQuery({
    queryKey: ["matches", filters],
    queryFn: async () => {
      return (await getMatchesAction(filters)).data;
    },
    staleTime: 30000, // 30 seconds
  });

  // Fetch streamers for filter options
  const { data: streamersData } = useQuery({
    queryKey: ["streamers", filters],
    queryFn: async () => (await getMatchesStreamersAction(filters)).data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch maps for filter options
  const maps = [
    "de_dust2",
    "de_inferno",
    "de_mirage",
    "de_nuke",
    "de_overpass",
    "de_vertigo",
    "de_ancient",
    "de_anubis",
    "de_cache",
    "de_train",
    "de_community",
  ];

  const handleFiltersChange = (newFilters: MatchFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (matchesError) {
    return (
      <div className="container mx-auto max-w-[1200px] px-4 py-8">
        <div className="gaming-slide-up">
          <div className="gaming-card flex flex-col items-center justify-center py-16 px-6 text-center">
            <h1 className="gaming-text-primary text-2xl font-bold mb-4">
              {t("matches.error.title")}
            </h1>
            <p className="gaming-text-secondary">
              {t("matches.error.description")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 space-y-6">
      {/* Header with gaming animation */}
      <div className="gaming-slide-up mb-8">
        <h1 className="gaming-text-primary text-4xl font-bold mb-2">
          {t("matches.title")}
        </h1>
        <p className="gaming-text-secondary text-lg">{t("matches.subtitle")}</p>
      </div>

      {/* Gaming divider */}
      <div className="gaming-divider mb-8"></div>

      {/* Filters and Cards Layout */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Filters Sidebar - Increased Width */}
        <div
          className="xl:w-[280px] xl:flex-shrink-0 gaming-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <StreamMatchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            streamers={streamersData?.streamers || []}
            maps={maps}
            isLoading={isLoadingMatches}
          />
        </div>

        {/* Main Content */}
        <div
          className="flex-1 space-y-6 gaming-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Results Header */}
          {!isLoadingMatches && pageData && (
            <div className="flex items-center justify-between">
              <h2 className="gaming-text-accent text-lg font-semibold">
                {t("matches.results.title")}
              </h2>
              <span className="gaming-text-secondary text-base">
                {t("matches.table.showing", {
                  start:
                    (pageData.pagination.page - 1) * pageData.pagination.limit +
                    1,
                  end: Math.min(
                    pageData.pagination.page * pageData.pagination.limit,
                    pageData.pagination.total
                  ),
                  total: pageData.pagination.total,
                })}
              </span>
            </div>
          )}

          {/* Match Cards */}
          <MatchCardList
            matchesData={pageData?.matchesData || []}
            isLoading={isLoadingMatches}
          />

          {/* Pagination */}
          {!isLoadingMatches &&
            pageData &&
            pageData.matchesData.length > 0 &&
            pageData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="gaming-text-secondary text-base">
                  {t("matches.pagination.page", {
                    current: pageData.pagination.page,
                    total: pageData.pagination.totalPages,
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gaming-button text-foreground hover:scale-105 transition-transform"
                    onClick={() =>
                      handlePageChange(pageData.pagination.page - 1)
                    }
                    disabled={pageData.pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("matches.pagination.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gaming-button text-foreground hover:scale-105 transition-transform"
                    onClick={() =>
                      handlePageChange(pageData.pagination.page + 1)
                    }
                    disabled={
                      pageData.pagination.page >= pageData.pagination.totalPages
                    }
                  >
                    {t("matches.pagination.next")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
