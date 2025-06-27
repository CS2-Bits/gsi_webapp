"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Package,
  Plus,
  Edit,
  CalendarIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  getSteamInventoryAction,
  updateSteamInventoryItemAction,
  createRaffleFromItemAction,
  getAllSteamBotsAction,
  syncInventoryAction,
} from "@/actions/dashboard/steam-inventory-action";
import {
  steam_bot_inventory_items,
  steam_items,
  user_inventory_items,
  currency,
  currency_schema,
} from "@prisma-zod/generated/zod.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Zod schemas for form validation
const updateItemSchema = z.object({
  price: z.string().min(1, "Price is required"),
  currency: currency_schema,
  fee: z.string().min(1, "Price is required"),
  marketable: z.boolean(),
});

const createRaffleSchema = z.object({
  ticketPrice: z.string().min(1, "Ticket price is required"),
  endDate: z.date({
    required_error: "End date is required",
  }),
});

type UpdateItemFormData = z.infer<typeof updateItemSchema>;
type CreateRaffleFormData = z.infer<typeof createRaffleSchema>;

export function SteamInventoryManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [nameFilter, setNameFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedItem, setSelectedItem] = useState<{
    steam_bot_inventory_items: steam_bot_inventory_items;
    steam_items: steam_items;
    user_inventory_items: user_inventory_items | null;
  } | null>(null);
  const [raffleDialogOpen, setRaffleDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [selectedSteamBot, setSelectedSteamBot] = useState<string>("");

  // React Hook Form for update item
  const updateForm = useForm<UpdateItemFormData>({
    resolver: zodResolver(updateItemSchema),
    defaultValues: {
      price: "0",
      currency: "USD",
      fee: "0",
      marketable: false,
    },
  });

  // React Hook Form for create raffle
  const raffleForm = useForm<CreateRaffleFormData>({
    resolver: zodResolver(createRaffleSchema),
    defaultValues: {
      ticketPrice: "0",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
    },
  });

  const { data: steamItemResponse, isLoading } = useQuery({
    queryKey: ["steamInventory", nameFilter, currentPage, pageSize],
    queryFn: () =>
      getSteamInventoryAction({
        name: nameFilter,
        pagination: { page: currentPage, limit: pageSize },
      }),
    select: (data) => data.data,
    refetchOnWindowFocus: false,
  });

  const { data: steamBotsData, isLoading: isLoadingSteamBots } = useQuery({
    queryKey: ["steamBots"],
    queryFn: () => getAllSteamBotsAction(),
    select: (data) => data.data,
    refetchOnWindowFocus: false,
  });

  const updateSteamInventoryItemMutation = useMutation({
    mutationFn: (params: {
      steam_item_id: string;
      marketable: boolean;
      currency: currency;
      price: number;
      fee: number;
    }) => {
      return updateSteamInventoryItemAction(
        params.steam_item_id,
        params.currency,
        params.price,
        params.fee,
        params.marketable
      );
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(t("admin.steamInventory.itemUpdated"));
        queryClient.invalidateQueries({ queryKey: ["steamInventory"] });
        setUpdateDialogOpen(false);
        updateForm.reset();
      } else {
        toast.error(data.error_message || t("admin.steamInventory.error"));
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : t("admin.steamInventory.error")
      );
    },
  });

  const createRaffleFromItemMutation = useMutation({
    mutationFn: (raffle: {
      steam_item_id: string;
      ticket_price: number;
      end_at: Date;
    }) => {
      return createRaffleFromItemAction(
        raffle.steam_item_id,
        raffle.ticket_price,
        raffle.end_at
      );
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(t("admin.steamInventory.raffleCreated"));
        queryClient.invalidateQueries({ queryKey: ["steamInventory"] });
        setRaffleDialogOpen(false);
        raffleForm.reset();
      } else {
        toast.error(data.error_message || t("admin.steamInventory.error"));
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : t("admin.steamInventory.error")
      );
    },
  });

  const syncInventoryMutation = useMutation({
    mutationFn: async (steamBotId: string) =>
      await syncInventoryAction(steamBotId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(t("admin.steamInventory.inventorySynced"));
        queryClient.invalidateQueries({ queryKey: ["steamInventory"] });
        setSyncDialogOpen(false);
        setSelectedSteamBot("");
      } else {
        toast.error(data.error_message || t("admin.steamInventory.error"));
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : t("admin.steamInventory.error")
      );
    },
  });

  const handleUpdateItem = (item: typeof selectedItem) => {
    setSelectedItem(item);
    if (item) {
      updateForm.reset({
        price: item.steam_items.estimated_fiat_value.toString(),
        currency: item.steam_items.currency,
        fee: item.steam_items.fee_pct.toString(),
        marketable: item.steam_bot_inventory_items.marketable,
      });
    }
    setUpdateDialogOpen(true);
  };

  const handleCreateRaffle = (item: typeof selectedItem) => {
    setSelectedItem(item);
    raffleForm.reset({
      ticketPrice: "0",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
    });
    setRaffleDialogOpen(true);
  };

  const handleSyncInventory = () => {
    setSyncDialogOpen(true);
  };

  const handleConfirmSync = () => {
    if (selectedSteamBot) {
      syncInventoryMutation.mutate(selectedSteamBot);
    }
  };

  const onUpdateSubmit = (data: UpdateItemFormData) => {
    if (!selectedItem) return;

    updateSteamInventoryItemMutation.mutate({
      steam_item_id: selectedItem.steam_items.asset_id,
      currency: data.currency,
      marketable: data.marketable,
      price: parseFloat(data.price),
      fee: parseFloat(data.fee),
    });
  };

  const onRaffleSubmit = (data: CreateRaffleFormData) => {
    if (!selectedItem) return;

    createRaffleFromItemMutation.mutate({
      steam_item_id: selectedItem.steam_items.asset_id,
      ticket_price: parseFloat(data.ticketPrice),
      end_at: data.endDate,
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (value: string) => {
    setNameFilter(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const steamItemData = steamItemResponse?.steamInventoryData;
  const pagination = steamItemResponse?.pagination;

  return (
    <div className="gaming-tabs-card">
      <Card className="border-0 bg-transparent">
        <CardHeader>
          <CardTitle className="gaming-text-primary flex items-center justify-between">
            {t("admin.steamInventory.title")}
            <Button
              onClick={handleSyncInventory}
              className="gaming-button"
              disabled={syncInventoryMutation.isPending}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${syncInventoryMutation.isPending ? "animate-spin" : ""}`}
              />
              {t("admin.steamInventory.syncInventory")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t("admin.steamInventory.searchPlaceholder")}
              value={nameFilter}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.steamInventory.item")}</TableHead>
                  <TableHead>{t("admin.steamInventory.type")}</TableHead>
                  <TableHead>
                    {t("admin.steamInventory.estimatedValue")}
                  </TableHead>
                  <TableHead>{t("admin.steamInventory.feeLabel")}</TableHead>
                  <TableHead>{t("admin.steamInventory.status")}</TableHead>
                  <TableHead className="text-right">
                    {t("admin.steamInventory.actions")}
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
                ) : !steamItemData || steamItemData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t("admin.steamInventory.noItemsFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  steamItemData.map((data) => (
                    <TableRow key={data.steam_items.asset_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={data.steam_items.image_url || undefined}
                              alt={data.steam_items.market_hash_name}
                            />
                            <AvatarFallback className="text-xs">
                              {data.steam_items.market_hash_name
                                ?.substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="font-medium text-sm">
                              {data.steam_items.market_hash_name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {data.steam_items.item_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="gaming-text-secondary">
                        {formatPrice(
                          data.steam_items.estimated_fiat_value,
                          data.steam_items.currency
                        )}
                      </TableCell>
                      <TableCell className="gaming-text-secondary">
                        {(data.steam_items.fee_pct * 100).toFixed(2)} %
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge
                            variant={
                              data.steam_bot_inventory_items.tradable
                                ? "default"
                                : "secondary"
                            }
                          >
                            {data.steam_bot_inventory_items.tradable
                              ? t("admin.steamInventory.tradable")
                              : t("admin.steamInventory.notTradable")}
                          </Badge>
                          <Badge
                            variant={
                              data.steam_bot_inventory_items.available
                                ? "default"
                                : "destructive"
                            }
                          >
                            {data.steam_bot_inventory_items.available
                              ? t("admin.steamInventory.available")
                              : t("admin.steamInventory.unavailable")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateItem(data)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {t("admin.steamInventory.updateItem")}
                          </Button>
                          {data.steam_bot_inventory_items.tradable &&
                            data.steam_bot_inventory_items.available && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCreateRaffle(data)}
                              >
                                <Package className="h-4 w-4 mr-1" />
                                {t("admin.steamInventory.createRaffle")}
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t("admin.pagination.showing", {
                  start: (pagination.page - 1) * pagination.limit + 1,
                  end: Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  ),
                  total: pagination.total,
                })}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="gaming-button-outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("admin.pagination.previous")}
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.page === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={
                            pagination.page === pageNum
                              ? "gaming-button"
                              : "gaming-button-outline"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="gaming-button-outline"
                >
                  {t("admin.pagination.next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Update Item Dialog with React Hook Form */}
          <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
            <DialogContent className="gaming-modal">
              <DialogHeader>
                <DialogTitle className="gaming-text-primary">
                  {t("admin.steamInventory.updateItem")}
                </DialogTitle>
              </DialogHeader>
              {selectedItem && (
                <Form {...updateForm}>
                  <form
                    onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={selectedItem.steam_items.image_url || undefined}
                          alt={selectedItem.steam_items.market_hash_name}
                        />
                        <AvatarFallback className="text-xs">
                          {selectedItem.steam_items.market_hash_name
                            ?.substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {selectedItem.steam_items.market_hash_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t("admin.steamInventory.currentValue")}:{" "}
                          {formatPrice(
                            selectedItem.steam_items.estimated_fiat_value,
                            selectedItem.steam_items.currency
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={updateForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("admin.steamInventory.priceLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="100.50"
                                className="gaming-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={updateForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("admin.steamInventory.currencyLabel")}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="gaming-input">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="BRL">BRL</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={updateForm.control}
                      name="fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("admin.steamInventory.feeLabel")} (%)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="5.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={updateForm.control}
                      name="marketable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {t("admin.steamInventory.marketableLabel")}
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={updateSteamInventoryItemMutation.isPending}
                      className="w-full gaming-button"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {updateSteamInventoryItemMutation.isPending
                        ? t("admin.steamInventory.updating")
                        : t("admin.steamInventory.updateItemButton")}
                    </Button>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>

          {/* Create Raffle Dialog with React Hook Form */}
          <Dialog open={raffleDialogOpen} onOpenChange={setRaffleDialogOpen}>
            <DialogContent className="gaming-modal">
              <DialogHeader>
                <DialogTitle className="gaming-text-primary">
                  {t("admin.steamInventory.createRaffle")}
                </DialogTitle>
              </DialogHeader>
              {selectedItem && (
                <Form {...raffleForm}>
                  <form
                    onSubmit={raffleForm.handleSubmit(onRaffleSubmit)}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={selectedItem.steam_items.image_url || undefined}
                          alt={selectedItem.steam_items.market_hash_name}
                        />
                        <AvatarFallback className="text-xs">
                          {selectedItem.steam_items.market_hash_name
                            ?.substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {selectedItem.steam_items.market_hash_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t("admin.steamInventory.estimatedValue")}:{" "}
                          {formatPrice(
                            selectedItem.steam_items.estimated_fiat_value,
                            selectedItem.steam_items.currency
                          )}
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={raffleForm.control}
                      name="ticketPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("admin.steamInventory.ticketPriceLabel")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="10.50"
                              className="gaming-input"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={raffleForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            {t("admin.steamInventory.endDateLabel", "End Date")}
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal gaming-input",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>
                                      {t(
                                        "admin.steamInventory.pickDate",
                                        "Pick a date"
                                      )}
                                    </span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date() ||
                                  date < new Date("1900-01-01")
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={createRaffleFromItemMutation.isPending}
                      className="w-full gaming-button"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {createRaffleFromItemMutation.isPending
                        ? t("admin.steamInventory.creating")
                        : t("admin.steamInventory.createRaffleButton")}
                    </Button>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>

          {/* Sync Inventory Dialog */}
          <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
            <DialogContent className="gaming-modal">
              <DialogHeader>
                <DialogTitle className="gaming-text-primary">
                  {t("admin.steamInventory.syncInventory")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("admin.steamInventory.selectSteamBot")}
                  </label>
                  <Select
                    value={selectedSteamBot}
                    onValueChange={setSelectedSteamBot}
                  >
                    <SelectTrigger className="gaming-input">
                      <SelectValue
                        placeholder={t(
                          "admin.steamInventory.selectSteamBotPlaceholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingSteamBots ? (
                        <SelectItem value="loading" disabled>
                          {t("admin.steamInventory.loading")}
                        </SelectItem>
                      ) : steamBotsData && steamBotsData.length > 0 ? (
                        steamBotsData.map((bot) => (
                          <SelectItem key={bot.steam_id} value={bot.steam_id}>
                            {bot.steam_id}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-bots" disabled>
                          {t("admin.steamInventory.noSteamBots")}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSyncDialogOpen(false)}
                    disabled={syncInventoryMutation.isPending}
                  >
                    {t("admin.steamInventory.cancel")}
                  </Button>
                  <Button
                    onClick={handleConfirmSync}
                    disabled={
                      !selectedSteamBot || syncInventoryMutation.isPending
                    }
                    className="gaming-button"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${syncInventoryMutation.isPending ? "animate-spin" : ""}`}
                    />
                    {syncInventoryMutation.isPending
                      ? t("admin.steamInventory.syncing")
                      : t("admin.steamInventory.syncButton")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
