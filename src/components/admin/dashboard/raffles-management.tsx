"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trophy, MoreHorizontal } from "lucide-react";
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
  getRafflesAction,
  updateRaffleStausAction,
} from "@/actions/dashboard/raffles-action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatPoints } from "@/lib/utils";
import {
  raffle_status,
  raffle_status_schema,
} from "@prisma-zod/generated/zod.schema";
import { formatDate } from "date-fns";
import { toast } from "sonner";

export function RafflesManagement() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const queryClient = useQueryClient();

  const { data: raffleData, isLoading } = useQuery({
    queryKey: ["raffles", startDate, endDate],
    queryFn: async () => await getRafflesAction({ startDate, endDate }),
    select: (data) => data.data,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      raffle_id,
      status,
    }: {
      raffle_id: string;
      status: raffle_status;
    }) => {
      return await updateRaffleStausAction(raffle_id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raffles"] });
      toast.success(t("admin.raffles.statusUpdated"));
    },
    onError: (error) => {
      console.error("Error updating raffle status:", error);
      toast.error(t("admin.raffles.statusUpdateError"), {
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const getStatusBadge = (status: raffle_status) => {
    const variants: Record<
      raffle_status,
      "secondary" | "default" | "outline" | "destructive"
    > = {
      created: "secondary",
      active: "default",
      closed: "outline",
      delivered: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="gaming-tabs-card">
      <Card className="border-0 bg-transparent">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="gaming-text-primary">
              {t("admin.raffles.title")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.raffles.item")}</TableHead>
                  <TableHead>{t("admin.raffles.ticketPrice")}</TableHead>
                  <TableHead>{t("admin.raffles.status_label")}</TableHead>
                  <TableHead>{t("admin.raffles.winner")}</TableHead>
                  <TableHead>{t("admin.raffles.endsAt")}</TableHead>
                  <TableHead className="text-right">
                    {t("admin.raffles.actions")}
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
                ) : !raffleData || raffleData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t("admin.raffles.noRafflesFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  raffleData.map((data) => (
                    <TableRow key={data.raffles.id}>
                      <TableCell className="font-medium">
                        {data.steam_items.market_hash_name}
                      </TableCell>
                      <TableCell className="gaming-text-secondary">
                        {formatPoints(data.raffles.ticket_price)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(data.raffles.status)}
                      </TableCell>
                      <TableCell>
                        {data.winner ? (
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            {data.winner.username}
                            {" - "} {data.winner.steam_id}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(data.raffles.end_at, "PPPpp")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={updateStatusMutation.isPending}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {Object.values(raffle_status_schema.enum).map(
                              (r) => (
                                <DropdownMenuItem
                                  key={r}
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      raffle_id: data.raffles.id,
                                      status: r,
                                    })
                                  }
                                >
                                  {t(`admin.raffles.status.${r}`)}
                                </DropdownMenuItem>
                              )
                            )}
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
