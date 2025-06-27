"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Plus,
  ExternalLink,
  Upload,
  X,
  Edit,
  Link,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  getStreamersAction,
  createStreamerAction,
  updateStreamerAction,
  createUpdateStreamUrlAction,
  deleteStreamUrlAction,
} from "@/actions/dashboard/streamers-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { uploadStreamerAvatarAction } from "@/actions/dashboard/upload-streamer-avatar-action";
import {
  stream_urls,
  streamers,
  user_status_schema,
  stream_provider_schema,
  stream_provider,
} from "@prisma-zod/generated/zod.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createStreamerSchema = z.object({
  steam_id: z.string().min(1, "Steam ID is required"),
  username_id: z
    .string()
    .min(1, "Username ID is required")
    .max(50, "Username ID must be less than 50 characters"),
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be less than 100 characters")
    .optional(),
  avatar_file: z.any().optional(),
});

const updateStreamerSchema = z.object({
  id: z.string().min(1, "ID is required"),
  username_id: z
    .string()
    .min(1, "Username ID is required")
    .max(50, "Username ID must be less than 50 characters"),
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be less than 100 characters")
    .optional(),
  user_status: user_status_schema,
  avatar_file: z.any().optional(),
});

const streamUrlSchema = z.object({
  stream_provider_name: stream_provider_schema,
  url: z.string().url("Please enter a valid URL"),
});

type CreateStreamerFormData = z.infer<typeof createStreamerSchema>;
type UpdateStreamerFormData = z.infer<typeof updateStreamerSchema>;
type StreamUrlFormData = z.infer<typeof streamUrlSchema>;

export function StreamersManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [nameFilter, setNameFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [streamUrlDialogOpen, setStreamUrlDialogOpen] = useState(false);
  const [editingStreamer, setEditingStreamer] = useState<{
    streamers: streamers;
    stream_urls: stream_urls[];
  } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const form = useForm<CreateStreamerFormData>({
    resolver: zodResolver(createStreamerSchema),
    defaultValues: {
      steam_id: "",
      username_id: "",
      display_name: "",
      avatar_file: undefined,
    },
  });

  const editForm = useForm<UpdateStreamerFormData>({
    resolver: zodResolver(updateStreamerSchema),
    defaultValues: {
      id: "",
      username_id: "",
      display_name: "",
      avatar_file: undefined,
    },
  });

  const streamUrlForm = useForm<StreamUrlFormData>({
    resolver: zodResolver(streamUrlSchema),
    defaultValues: {
      stream_provider_name: "twitch",
      url: "",
    },
  });

  // Upload avatar to storage
  const uploadAvatar = async (id: string, file: File): Promise<string> => {
    setUploadingAvatar(true);
    try {
      const res = await uploadStreamerAvatarAction(id, file);

      if (!res?.data) {
        throw new Error("Failed to get public URL");
      }

      return res.data;
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle file selection and preview
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast.error(t("admin.streamers.invalidFileType"));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      form.setValue("avatar_file", file);
      editForm.setValue("avatar_file", file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear avatar selection
  const clearAvatar = () => {
    form.setValue("avatar_file", undefined);
    setAvatarPreview(null);
    const fileInput = document.getElementById(
      "avatar-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Query for fetching streamers
  const {
    data: streamers,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["streamers", nameFilter],
    queryFn: async () => {
      const response = await getStreamersAction({
        name: nameFilter || undefined,
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error("Failed to fetch streamers");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for creating streamers
  const createStreamerMutation = useMutation({
    mutationFn: async (data: CreateStreamerFormData) => {
      let avatarUrl: string | undefined;

      // Upload avatar if provided
      if (data.avatar_file) {
        try {
          avatarUrl = await uploadAvatar(data.steam_id, data.avatar_file);
        } catch (error) {
          console.error("Avatar upload failed:", error);
          throw new Error("Failed to upload avatar image");
        }
      }

      const response = await createStreamerAction({
        steam_id: data.steam_id,
        username_id: data.username_id,
        display_name: data.display_name,
        avatar_url: avatarUrl,
      });

      if (!response.success) {
        throw new Error("Failed to create streamer");
      }
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch streamers query
      queryClient.invalidateQueries({ queryKey: ["streamers"] });
      setDialogOpen(false);
      form.reset();
      setAvatarPreview(null);
      toast.success(t("admin.streamers.streamerCreated"));
    },
    onError: (error) => {
      console.error("Error creating streamer:", error);
      toast.error(t("error.internal_error"), {
        description: error.message,
      });
    },
  });

  // Mutation for updating streamers
  const updateStreamerMutation = useMutation({
    mutationFn: async (data: UpdateStreamerFormData) => {
      let avatarUrl: string | undefined;

      if (!editingStreamer) {
        throw new Error("No streamer is being edited");
      }

      // Upload avatar if provided
      if (data.avatar_file) {
        try {
          // Use the existing steam_id from the editing streamer
          avatarUrl = await uploadAvatar(
            editingStreamer.streamers.id,
            data.avatar_file
          );
        } catch (error) {
          console.error("Avatar upload failed:", error);
          throw new Error("Failed to upload avatar image");
        }
      }

      const response = await updateStreamerAction({
        id: data.id,
        username_id: data.username_id,
        display_name: data.display_name,
        streamer_status: data.user_status,
        avatar_url: avatarUrl,
      });

      if (!response.success) {
        throw new Error("Failed to update streamer");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streamers"] });
      setEditDialogOpen(false);
      setEditingStreamer(null);
      editForm.reset();
      setAvatarPreview(null);
      toast.success(t("admin.streamers.streamerUpdated"));
    },
    onError: (error) => {
      console.error("Error updating streamer:", error);
      toast.error(t("error.internal_error"), {
        description: error.message,
      });
    },
  });

  // Mutation for creating/updating stream URLs
  const createUpdateStreamUrlMutation = useMutation({
    mutationFn: async (data: StreamUrlFormData & { streamer_id: string }) => {
      const response = await createUpdateStreamUrlAction({
        streamer_id: data.streamer_id,
        stream_provider_name: data.stream_provider_name,
        url: data.url,
      });

      if (!response.success) {
        throw new Error("Failed to create/update stream URL");
      }
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["streamers"] });
      setEditingStreamer(response.data ?? null);
      streamUrlForm.reset();
      toast.success(t("admin.streamers.streamUrlUpdated"));
    },
    onError: (error) => {
      console.error("Error creating/updating stream URL:", error);
      toast.error(t("error.internal_error"), {
        description: error.message,
      });
    },
  });

  // Mutation for deleting stream URLs
  const deleteStreamUrlMutation = useMutation({
    mutationFn: async (data: {
      streamer_id: string;
      stream_provider_name: stream_provider;
    }) => {
      const response = await deleteStreamUrlAction({
        streamer_id: data.streamer_id,
        stream_provider_name: data.stream_provider_name,
      });

      if (!response.success) {
        throw new Error("Failed to delete stream URL");
      }
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["streamers"] });
      setEditingStreamer(response.data ?? null);
      toast.success(t("admin.streamers.streamUrlDeleted"));
    },
    onError: (error) => {
      console.error("Error deleting stream URL:", error);
      toast.error(t("error.internal_error"), {
        description: error.message,
      });
    },
  });

  const handleCreateStreamer = (data: CreateStreamerFormData) => {
    createStreamerMutation.mutate(data);
  };

  const handleUpdateStreamer = (data: UpdateStreamerFormData) => {
    updateStreamerMutation.mutate(data);
  };

  const handleCreateUpdateStreamUrl = (data: StreamUrlFormData) => {
    if (!editingStreamer) return;

    createUpdateStreamUrlMutation.mutate({
      ...data,
      streamer_id: editingStreamer.streamers.id,
    });
  };

  const handleDeleteStreamUrl = (stream_provider_name: stream_provider) => {
    if (!editingStreamer) return;

    deleteStreamUrlMutation.mutate({
      streamer_id: editingStreamer.streamers.id,
      stream_provider_name,
    });
  };

  const openEditDialog = (streamerData: {
    streamers: streamers;
    stream_urls: stream_urls[];
  }) => {
    setEditingStreamer(streamerData);
    editForm.reset({
      id: streamerData.streamers.id,
      username_id: streamerData.streamers.username_id,
      user_status: streamerData.streamers.user_status,
      display_name: streamerData.streamers.display_name || undefined,
      avatar_file: undefined,
    });
    setAvatarPreview(streamerData.streamers.avatar_url ?? null);
    setEditDialogOpen(true);
  };

  const openStreamUrlDialog = (streamerData: {
    streamers: streamers;
    stream_urls: stream_urls[];
  }) => {
    setEditingStreamer(streamerData);
    streamUrlForm.reset();
    setStreamUrlDialogOpen(true);
  };

  return (
    <div className="gaming-tabs-card">
      <Card className="border-0 bg-transparent">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="gaming-text-primary">
              {t("admin.streamers.title")}
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gaming-button">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("admin.streamers.newStreamer")}
                </Button>
              </DialogTrigger>
              <DialogContent className="gaming-modal" title="">
                <DialogHeader>
                  <DialogTitle className="gaming-text-primary">
                    {t("admin.streamers.createNewStreamer")}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleCreateStreamer)}
                    className="space-y-4"
                  >
                    {/* Avatar Upload Section */}
                    <div className="space-y-2">
                      <FormLabel>{t("admin.streamers.avatar")}</FormLabel>
                      <div className="flex items-center gap-4">
                        {avatarPreview ? (
                          <div className="relative">
                            <Avatar className="w-16 h-16">
                              <AvatarImage
                                src={avatarPreview}
                                alt="Avatar preview"
                              />
                              <AvatarFallback>AV</AvatarFallback>
                            </Avatar>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={clearAvatar}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/50 rounded-full flex items-center justify-center">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input
                            id="avatar-upload"
                            type="file"
                            accept="image/jpg,image/jpeg,image/png"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("avatar-upload")?.click()
                            }
                            disabled={uploadingAvatar}
                          >
                            {uploadingAvatar
                              ? t("admin.streamers.uploading")
                              : t("admin.streamers.chooseImage")}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            Max 5MB, JPG/PNG only
                          </p>
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="steam_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.streamers.steamId")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter steam ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("admin.streamers.usernameId")}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter username ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="display_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("admin.streamers.displayName")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter display name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full gaming-button"
                      disabled={
                        createStreamerMutation.isPending || uploadingAvatar
                      }
                    >
                      {createStreamerMutation.isPending
                        ? t("admin.streamers.creating")
                        : t("admin.streamers.createStreamer")}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t("admin.users.searchPlaceholder")}
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.streamers.streamer")}</TableHead>
                  <TableHead>Username ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>{t("admin.streamers.affiliateBalance")}</TableHead>
                  <TableHead>{t("admin.streamers.links")}</TableHead>
                  <TableHead>{t("admin.streamers.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="gaming-skeleton h-4 w-32 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-red-500"
                    >
                      Error loading streamers
                    </TableCell>
                  </TableRow>
                ) : streamers?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t("admin.streamers.noStreamersFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  streamers?.map((data) => (
                    <TableRow key={data.streamers.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 flex items-center justify-center">
                            <AvatarImage
                              src={data.streamers.avatar_url || undefined}
                              className="rounded-full"
                            />
                            <AvatarFallback>
                              {(
                                data.streamers.display_name ||
                                data.streamers.username_id
                              )
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {data.streamers.display_name ||
                                data.streamers.username_id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {data.streamers.username_id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            data.streamers.user_status === "Active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {data.streamers.user_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="gaming-text-secondary">
                        R$ {data.streamers.affiliate_balance.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {data.stream_urls.map((url, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={url.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                                {url.stream_provider_name}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(data)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStreamUrlDialog(data)}
                          >
                            <Link className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="gaming-modal" title="">
          <DialogHeader>
            <DialogTitle className="gaming-text-primary">
              {t("admin.streamers.editStreamer")}
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdateStreamer)}
              className="space-y-4"
            >
              {/* Avatar Upload Section */}
              <div className="space-y-2">
                <FormLabel>{t("admin.streamers.avatar")}</FormLabel>
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <div className="relative">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={avatarPreview} alt="Avatar preview" />
                        <AvatarFallback>AV</AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={clearAvatar}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/50 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="edit-avatar-upload"
                      type="file"
                      accept="image/jpg,image/jpeg,image/png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("edit-avatar-upload")?.click()
                      }
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar
                        ? t("admin.streamers.uploading")
                        : t("admin.streamers.chooseImage")}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 5MB, JPG/PNG only
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={editForm.control}
                name="username_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.streamers.usernameId")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.streamers.displayName")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="user_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.streamers.status_label")}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(user_status_schema.Values).map(
                            (status) => (
                              <SelectItem key={status} value={status}>
                                {t(`admin.streamers.status.${status}`)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full gaming-button"
                disabled={updateStreamerMutation.isPending || uploadingAvatar}
              >
                {updateStreamerMutation.isPending
                  ? t("admin.streamers.updating")
                  : t("admin.streamers.updateStreamer")}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Stream URL Management Dialog */}
      <Dialog open={streamUrlDialogOpen} onOpenChange={setStreamUrlDialogOpen}>
        <DialogContent className="gaming-modal max-w-2xl" title="">
          <DialogHeader>
            <DialogTitle className="gaming-text-primary">
              {t("admin.streamers.editStreamer")} -{" "}
              {editingStreamer?.streamers.display_name ||
                editingStreamer?.streamers.username_id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Existing URLs */}
            <div className="space-y-2">
              <h4 className="font-medium">
                {t("admin.streamers.existingUrls")}
              </h4>
              {editingStreamer?.stream_urls.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t("admin.streamers.noUrlsYet")}
                </p>
              ) : (
                <div className="space-y-2">
                  {editingStreamer?.stream_urls.map((url) => (
                    <div
                      key={url.stream_provider_name}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {url.stream_provider_name}
                        </Badge>
                        <a
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline truncate max-w-xs"
                        >
                          {url.url}
                        </a>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteStreamUrl(url.stream_provider_name)
                        }
                        disabled={deleteStreamUrlMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add/Update URL Form */}
            <div className="space-y-2">
              <h4 className="font-medium">
                {t("admin.streamers.addUpdateUrl")}
              </h4>
              <Form {...streamUrlForm}>
                <form
                  onSubmit={streamUrlForm.handleSubmit(
                    handleCreateUpdateStreamUrl
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={streamUrlForm.control}
                    name="stream_provider_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.streamers.platform")}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(stream_provider_schema.Values).map(
                                (provider) => (
                                  <SelectItem key={provider} value={provider}>
                                    {provider.charAt(0).toUpperCase() +
                                      provider.slice(1)}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={streamUrlForm.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.streamers.streamUrl")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://twitch.tv/username"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full gaming-button"
                    disabled={createUpdateStreamUrlMutation.isPending}
                  >
                    {createUpdateStreamUrlMutation.isPending
                      ? t("admin.streamers.updating")
                      : t("admin.streamers.saveUrl")}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
