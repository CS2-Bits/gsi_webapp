"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, MoreHorizontal } from "lucide-react";
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
  getPredictionsAction,
  updatePredictionStatusAction,
} from "@/actions/dashboard/predictions-action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bet_state, prediction_kind } from "@prisma-zod/generated/zod.schema";
import { formatPoints } from "@/lib/utils";
import { formatDate } from "date-fns";
import { toast } from "sonner";

export function PredictionsManagement() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const queryClient = useQueryClient();
  const { data: predictionsData, isLoading } = useQuery({
    queryKey: ["predictions", startDate, endDate, statusFilter],
    queryFn: async () => {
      const state: bet_state | undefined =
        statusFilter === "all" ? undefined : (statusFilter as bet_state);

      const response = await getPredictionsAction({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: state,
      });
      if (response.success && response.data) {
        return response.data;
      }
    },
  });

  const updateMatchStatusMutation = useMutation({
    mutationFn: async (data: { prediction_id: string; status: bet_state }) => {
      const response = await updatePredictionStatusAction(
        data.prediction_id,
        data.status
      );
      if (!response.success) {
        throw new Error(
          response.error_message || "Failed to update match status"
        );
      }
      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      toast.success(t("admin.predictions.statusUpdated"));
    },
    onError: (error) => {
      toast.error(t("admin.predictions.statusUpdateFailed"), {
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const getStatusBadge = (status: bet_state) => {
    const variants: Record<
      bet_state,
      "default" | "secondary" | "outline" | "destructive"
    > = {
      Open: "default",
      Closed: "secondary",
      Resolved: "outline",
      Canceled: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getKindLabel = (kind: prediction_kind) => {
    return t(`admin.predictions.types.${kind}`) || kind;
  };

  return (
    <div className="gaming-tabs-card">
      <Card className="border-0 bg-transparent">
        <CardHeader>
          <CardTitle className="gaming-text-primary">
            {t("admin.predictions.title")}
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
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.common.all")}</SelectItem>
                <SelectItem value="Open">
                  {t("admin.predictions.open")}
                </SelectItem>
                <SelectItem value="Closed">
                  {t("admin.predictions.closed")}
                </SelectItem>
                <SelectItem value="Resolved">
                  {t("admin.predictions.resolved")}
                </SelectItem>
                <SelectItem value="Canceled">
                  {t("admin.predictions.canceled")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.predictions.type")}</TableHead>
                  <TableHead>{t("admin.predictions.matchId")}</TableHead>
                  <TableHead>{t("admin.predictions.status")}</TableHead>
                  <TableHead>{t("admin.predictions.feesCollected")}</TableHead>
                  <TableHead>{t("admin.predictions.createdAt")}</TableHead>
                  <TableHead className="text-right">
                    {t("admin.predictions.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="gaming-skeleton h-4 w-32 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : !predictionsData || predictionsData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t("admin.predictions.noPredictionsFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  predictionsData.map((data) => (
                    <TableRow key={data.predictions.id}>
                      <TableCell>
                        <Badge variant="outline" className="gaming-badge">
                          {getKindLabel(data.prediction_templates.kind)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {data.predictions.stream_match_id}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(data.predictions.state)}
                      </TableCell>
                      <TableCell className="gaming-text-secondary">
                        {data.predictions.fees_total_collected ? (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {formatPoints(
                              data.predictions.fees_total_collected
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(
                          data.predictions.created_at,
                          "dd/MM/yyyy HH:mm"
                        )}
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
                              onClick={() =>
                                updateMatchStatusMutation.mutate({
                                  prediction_id: data.predictions.id,
                                  status: "Open",
                                })
                              }
                            >
                              {t("admin.predictions.markAsOpen")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateMatchStatusMutation.mutate({
                                  prediction_id: data.predictions.id,
                                  status: "Closed",
                                })
                              }
                            >
                              {t("admin.predictions.markAsClosed")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateMatchStatusMutation.mutate({
                                  prediction_id: data.predictions.id,
                                  status: "Resolved",
                                })
                              }
                            >
                              {t("admin.predictions.markAsResolved")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateMatchStatusMutation.mutate({
                                  prediction_id: data.predictions.id,
                                  status: "Canceled",
                                })
                              }
                            >
                              {t("admin.predictions.markAsCanceled")}
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
