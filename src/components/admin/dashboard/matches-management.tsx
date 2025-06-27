"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  stream_match_status,
  stream_match_status_schema,
} from "@prisma-zod/generated/zod.schema";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import {
  getStreamMatchesAction,
  updateStreamMatchesStatusAction,
} from "@/actions/dashboard/stream-matches-action";

export function MatchesManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: matchesData, isLoading } = useQuery({
    queryKey: ["matches", startDate, endDate, statusFilter],
    queryFn: async () => {
      const stream_match: stream_match_status | undefined =
        statusFilter === "all" || !statusFilter
          ? undefined
          : stream_match_status_schema.safeParse(statusFilter).success
            ? (statusFilter as stream_match_status)
            : undefined;
      const response = await getStreamMatchesAction({
        startDate,
        endDate,
        status: stream_match,
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error("Failed to fetch matches");
    },
  });

  const updateMatchStatusMutation = useMutation({
    mutationFn: async ({
      matchId,
      newStatus,
    }: {
      matchId: string;
      newStatus: stream_match_status;
    }) => {
      const response = await updateStreamMatchesStatusAction(
        matchId,
        newStatus
      );
      if (!response.success) {
        throw new Error("Failed to update match status");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const getStatusBadge = (status: stream_match_status) => {
    const variants: Record<
      stream_match_status,
      "secondary" | "default" | "outline" | "destructive"
    > = {
      Preparing: "secondary",
      Live: "default",
      Finished: "outline",
      Invalidated: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="gaming-tabs-card">
      <Card className="border-0 bg-transparent">
        <CardHeader>
          <CardTitle className="gaming-text-primary">
            {t("admin.matches.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-1">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="gaming-input"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="gaming-input"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("admin.matches.status_label")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.matches.all")}</SelectItem>
                {Object.values(stream_match_status_schema.Values).map(
                  (status) => (
                    <SelectItem key={status} value={status}>
                      {t(`admin.matches.status.${status}`)}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.matches.streamer")}</TableHead>
                  <TableHead>{t("admin.matches.map")}</TableHead>
                  <TableHead>{t("admin.matches.status_label")}</TableHead>
                  <TableHead>{t("admin.matches.startedAt")}</TableHead>
                  <TableHead>{t("admin.matches.finishedAt")}</TableHead>
                  <TableHead className="text-right">
                    {t("admin.matches.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!matchesData && isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="gaming-skeleton h-4 w-32 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : !matchesData || matchesData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t("admin.matches.noMatchesFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  matchesData.map((data) => (
                    <TableRow key={data.matches.id}>
                      <TableCell className="font-medium">
                        {data.streamers.username_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gaming-badge">
                          {data.matches.map_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(data.stream_matches.match_status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(
                          data.matches.started_at,
                          "dd/MM/yyyy HH:mm"
                        )}
                      </TableCell>
                      <TableCell>
                        {data.matches.ended_at
                          ? formatDate(
                              data.matches.ended_at,
                              "dd/MM/yyyy HH:mm"
                            )
                          : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                updateMatchStatusMutation.mutate({
                                  matchId: data.stream_matches.id,
                                  newStatus:
                                    stream_match_status_schema.enum.Finished,
                                });
                              }}
                            >
                              {t("admin.matches.markAsFinished")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                updateMatchStatusMutation.mutate({
                                  matchId: data.stream_matches.id,
                                  newStatus:
                                    stream_match_status_schema.enum.Invalidated,
                                });
                              }}
                            >
                              {t("admin.matches.markAsInvalid")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
