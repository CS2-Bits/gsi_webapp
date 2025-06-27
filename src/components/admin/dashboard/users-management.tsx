"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  MoreHorizontal,
  UserCog,
  Plus,
  X,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  getUsersAction,
  updateUserStatusAction,
  addUserRoleAction,
  removeUserRoleAction,
} from "@/actions/dashboard/users-actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  role_type,
  role_type_schema,
  user_roles,
  user_status,
  users,
} from "@prisma-zod/generated/zod.schema";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export function UsersManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserData, setSelectedUser] = useState<{
    user: users;
    users_roles: user_roles[];
  } | null>(null);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const availableRoles = Object.values(role_type_schema.Values);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["admin-users", nameFilter, statusFilter, currentPage],
    queryFn: async () => {
      const response = await getUsersAction({
        name: nameFilter,
        status: (statusFilter as user_status) || undefined,
        pagination: {
          page: currentPage,
          limit: 20,
        },
      });
      if (response.success && response.data) {
        return response.data;
      }
      return {
        users: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    },
    staleTime: 30000, // 30 seconds
  });

  const users = data?.users || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  // Reset to page 1 when filters change
  const handleFilterChange = (
    newNameFilter: string,
    newStatusFilter: string
  ) => {
    setNameFilter(newNameFilter);
    setStatusFilter(newStatusFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      newStatus,
    }: {
      userId: string;
      newStatus: user_status;
    }) => {
      return await updateUserStatusAction(userId, newStatus);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUser(data.data ?? null);
    },
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: role_type;
    }) => {
      return await addUserRoleAction(userId, role);
    },
    onSuccess: (data) => {
      setSelectedRole("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUser(data.data ?? null);
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: role_type;
    }) => {
      return await removeUserRoleAction(userId, role);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUser(data.data ?? null);
    },
  });

  const handleStatusUpdate = async (userId: string, newStatus: user_status) => {
    updateStatusMutation.mutate({ userId, newStatus });
  };

  const handleAddRole = async () => {
    if (!selectedUserData || !selectedRole) return;
    addRoleMutation.mutate({
      userId: selectedUserData.user.id,
      role: selectedRole as role_type,
    });
  };

  const handleRemoveRole = async (role: role_type) => {
    if (!selectedUserData) return;
    removeRoleMutation.mutate({ userId: selectedUserData.user.id, role });
  };

  const getStatusBadge = (status: user_status) => {
    const variants = {
      Active: "default",
      Inactive: "secondary",
      Banned: "destructive",
      Deleted: "outline",
    } as const;

    type BadgeVariant = (typeof variants)[keyof typeof variants];

    return (
      <Badge
        variant={variants[status as keyof typeof variants] as BadgeVariant}
      >
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      Admin: "destructive",
      EventsLog: "default",
      Streamer: "secondary",
      User: "secondary",
    } as const;

    type BadgeVariant = (typeof roleColors)[keyof typeof roleColors];

    return (
      <Badge
        variant={roleColors[role as keyof typeof roleColors] as BadgeVariant}
        className="text-xs"
      >
        {t(`admin.users.roleTypes.${role}`) || role}
      </Badge>
    );
  };

  const getAvailableRolesToAdd = () => {
    if (!selectedUserData) return availableRoles;
    return availableRoles.filter(
      (role) =>
        !selectedUserData.users_roles.map((r) => r.role_name).includes(role)
    );
  };

  return (
    <div className="gaming-tabs-card">
      <Card className="border-0 bg-transparent">
        <CardHeader>
          <CardTitle className="gaming-text-primary">
            {t("admin.users.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("admin.users.searchPlaceholder")}
                value={nameFilter}
                onChange={(e) =>
                  handleFilterChange(e.target.value, statusFilter)
                }
                className="pl-10 "
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => handleFilterChange(nameFilter, value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("admin.users.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.users.all")}</SelectItem>
                <SelectItem value="Active">
                  {t("admin.users.active")}
                </SelectItem>
                <SelectItem value="Inactive">
                  {t("admin.users.inactive")}
                </SelectItem>
                <SelectItem value="Banned">
                  {t("admin.users.banned")}
                </SelectItem>
                <SelectItem value="Deleted">
                  {t("admin.users.deleted")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.users.user")}</TableHead>
                  <TableHead>{t("admin.users.steamId")}</TableHead>
                  <TableHead>{t("admin.users.status")}</TableHead>
                  <TableHead>{t("admin.users.roles")}</TableHead>
                  <TableHead>{t("admin.users.createdAt")}</TableHead>
                  <TableHead className="text-right">
                    {t("admin.users.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="gaming-skeleton h-4 w-32 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t("admin.users.noUsersFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((data) => (
                    <TableRow key={data.user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 flex items-center justify-center">
                            <AvatarImage
                              src={data.user.avatar_url || undefined}
                              className="rounded-full"
                            />
                            <AvatarFallback className="flex items-center justify-center">
                              {data.user.username
                                .substring(0, 2)
                                .toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {data.user.username}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {data.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {data.user.steam_id}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(data.user.user_status_name)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {data.users_roles.length > 0 ? (
                            data.users_roles.map((role) => (
                              <div key={role.role_name}>
                                {getRoleBadge(role.role_name)}
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {t("admin.users.noRoles")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(data.user.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Dialog
                            open={rolesDialogOpen}
                            onOpenChange={setRolesDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUser(data)}
                              >
                                <UserCog className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="gaming-modal max-w-md">
                              <DialogHeader>
                                <DialogTitle className="gaming-text-primary">
                                  {t("admin.users.manageRoles")} -{" "}
                                  {selectedUserData?.user.username}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedUserData && (
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      {t("admin.users.userRoles")}
                                    </Label>
                                    <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-lg min-h-[60px]">
                                      {selectedUserData.users_roles.length >
                                      0 ? (
                                        selectedUserData.users_roles.map(
                                          (role) => (
                                            <div
                                              key={role.role_name}
                                              className="flex items-center gap-1"
                                            >
                                              {getRoleBadge(role.role_name)}
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                                onClick={() =>
                                                  handleRemoveRole(
                                                    role.role_name
                                                  )
                                                }
                                                disabled={
                                                  removeRoleMutation.isPending
                                                }
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          )
                                        )
                                      ) : (
                                        <span className="text-sm text-muted-foreground">
                                          {t("admin.users.noRoles")}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">
                                      {t("admin.users.addRole")}
                                    </Label>
                                    <div className="flex gap-2 mt-2">
                                      <Select
                                        value={selectedRole}
                                        onValueChange={setSelectedRole}
                                      >
                                        <SelectTrigger className="flex-1">
                                          <SelectValue
                                            placeholder={t(
                                              "admin.users.selectRole"
                                            )}
                                          />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getAvailableRolesToAdd().map(
                                            (role) => (
                                              <SelectItem
                                                key={role}
                                                value={role}
                                              >
                                                {t(
                                                  `admin.users.roleTypes.${role}`
                                                ) || role}
                                              </SelectItem>
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        onClick={handleAddRole}
                                        disabled={
                                          !selectedRole ||
                                          addRoleMutation.isPending
                                        }
                                        size="sm"
                                        className="gaming-button"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

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
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(data.user.id, "Active")
                                }
                              >
                                {t("admin.users.activate")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(data.user.id, "Inactive")
                                }
                              >
                                {t("admin.users.deactivate")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(data.user.id, "Banned")
                                }
                              >
                                {t("admin.users.ban")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="gaming-text-secondary text-base">
                {t("pagination.showing", {
                  start: (pagination.page - 1) * pagination.limit + 1,
                  end: Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  ),
                  total: pagination.total,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gaming-button text-foreground hover:scale-105 transition-transform"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("pagination.previous")}
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNumber;
                      if (pagination.totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNumber = pagination.totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            currentPage === pageNumber ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          disabled={loading}
                          className={`w-8 h-8 p-0 hover:scale-105 transition-transform ${
                            currentPage === pageNumber
                              ? "gaming-button text-foreground"
                              : ""
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gaming-button text-foreground hover:scale-105 transition-transform"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext || loading}
                >
                  {t("pagination.next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
