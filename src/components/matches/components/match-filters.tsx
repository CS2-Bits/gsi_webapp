"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { stream_match_status } from "@prisma/client";
import { cn } from "@/lib/utils";
import { formatMapName } from "@/types/map-name";
import { MatchFilters } from "@/schemas/match_filters.schema";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { streamers } from "@prisma-zod/generated/zod.schema";

interface MatchFiltersProps {
  filters: MatchFilters;
  onFiltersChange: (filters: MatchFilters) => void;
  streamers: streamers[];
  maps: string[];
  isLoading?: boolean;
}

export function StreamMatchFilters({
  filters,
  onFiltersChange,
  streamers,
  maps,
  isLoading = false,
}: MatchFiltersProps) {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedStreamers, setSelectedStreamers] = useState<string[]>(
    filters.streamerIds || []
  );
  const [selectedMaps, setSelectedMaps] = useState<string[]>(
    filters.mapIds || []
  );

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === "all" ? undefined : (status as stream_match_status),
      page: 1,
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onFiltersChange({
      ...filters,
      dateFrom: range?.from?.toISOString(),
      dateTo: range?.to?.toISOString(),
      page: 1,
    });
  };

  const handleStreamerToggle = (streamerId: string) => {
    const newSelected = selectedStreamers.includes(streamerId)
      ? selectedStreamers.filter((id) => id !== streamerId)
      : [...selectedStreamers, streamerId];

    setSelectedStreamers(newSelected);
    onFiltersChange({
      ...filters,
      streamerIds: newSelected.length > 0 ? newSelected : undefined,
      page: 1,
    });
  };

  const handleMapToggle = (mapId: string) => {
    const newSelected = selectedMaps.includes(mapId)
      ? selectedMaps.filter((id) => id !== mapId)
      : [...selectedMaps, mapId];

    setSelectedMaps(newSelected);
    onFiltersChange({
      ...filters,
      mapIds: newSelected.length > 0 ? newSelected : undefined,
      page: 1,
    });
  };

  const clearFilters = () => {
    setDateRange(undefined);
    setSelectedStreamers([]);
    setSelectedMaps([]);
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters =
    filters.status ||
    filters.dateFrom ||
    filters.dateTo ||
    (filters.streamerIds && filters.streamerIds.length > 0) ||
    (filters.mapIds && filters.mapIds.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {t("matches.filters.title")}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              {t("matches.filters.clear")}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label>{t("matches.filters.status")}</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("matches.filters.allStatus")}
              </SelectItem>
              <SelectItem value={stream_match_status.Live}>
                {t("matches.status.live")}
              </SelectItem>
              <SelectItem value={stream_match_status.Finished}>
                {t("matches.status.finished")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>{t("matches.filters.dateRange")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>{t("matches.filters.pickDate")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Streamers Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {t("matches.filters.streamers")}
          </Label>
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2 bg-muted/20">
            {streamers.map((streamer) => (
              <div
                key={streamer.id}
                className="flex items-center space-x-3 p-1 hover:bg-muted/50 rounded"
              >
                <Checkbox
                  id={`streamer-${streamer.id}`}
                  checked={selectedStreamers.includes(streamer.id)}
                  onCheckedChange={() => handleStreamerToggle(streamer.id)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor={`streamer-${streamer.id}`}
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={streamer.avatar_url ?? undefined}
                      alt={streamer.username_id}
                    />
                    <AvatarFallback>
                      {streamer.username_id.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{streamer.username_id}</span>
                </Label>
              </div>
            ))}
          </div>
          {selectedStreamers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedStreamers.map((streamerId) => {
                const streamer = streamers.find((s) => s.id === streamerId);
                return streamer ? (
                  <Badge
                    key={streamerId}
                    variant="secondary"
                    className="text-xs"
                  >
                    {streamer.username_id}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Maps Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {t("matches.filters.maps")}
          </Label>
          <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2 bg-muted/20">
            {maps.map((map) => (
              <div
                key={"id-" + map}
                className="flex items-center space-x-3 p-1 hover:bg-muted/50 rounded"
              >
                <Checkbox
                  id={`map-${map}`}
                  checked={selectedMaps.includes(map)}
                  onCheckedChange={() => handleMapToggle(map)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor={`map-${map}`}
                  className="cursor-pointer text-sm flex-1"
                >
                  {formatMapName(map)}
                </Label>
              </div>
            ))}
          </div>
          {selectedMaps.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedMaps.map((mapId) => {
                const map = maps.find((m) => m === mapId);
                return map ? (
                  <Badge key={mapId} variant="secondary" className="text-xs">
                    {formatMapName(map)}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
