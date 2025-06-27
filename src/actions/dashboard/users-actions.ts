"use server";

import { prisma } from "@/lib/prisma";
import { UserRoleSchema } from "@/schemas/users.schema";
import {
  PaginationParams,
  PaginationParamsSchema,
  PaginationSchema,
  Pagination,
} from "@/schemas/pagination.schema";
import {
  role_type,
  user_roles,
  user_status,
  users,
  users_schema,
} from "@prisma-zod/generated/zod.schema";
import { ActionResponse } from "@/types/action-response";
import { getUserAdmin } from "./get-user-admin";

async function getUserById(userId: string): Promise<
  ActionResponse<{
    user: users;
    users_roles: user_roles[];
  }>
> {
  const userData = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      user_roles: true,
    },
  });

  if (!userData) {
    return {
      success: false,
      error_message: "error.user_not_found",
    };
  }

  return {
    success: true,
    data: {
      user: users_schema.parse(userData),
      users_roles:
        userData?.user_roles.map((role) => UserRoleSchema.parse(role)) || [],
    },
  };
}

export async function getUsersAction(filters?: {
  name?: string;
  status?: user_status;
  pagination?: PaginationParams;
}): Promise<
  ActionResponse<{
    users: {
      user: users;
      users_roles: user_roles[];
    }[];
    pagination: Pagination;
  }>
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }

  let page = 1;
  let limit = 20;
  if (filters?.pagination) {
    ({ page, limit } = PaginationParamsSchema.parse(filters.pagination));
  }
  const skip = (page - 1) * limit;

  const where = {
    username: {
      contains: filters?.name || "",
      mode: "insensitive" as const,
    },
    user_status_name: filters?.status || undefined,
  };

  const total = await prisma.users.count({
    where,
  });

  const users = await prisma.users.findMany({
    where,
    include: {
      user_roles: true,
    },
    orderBy: {
      created_at: "desc",
    },
    skip,
    take: limit,
  });

  const usersParsed = users.map((user) => {
    return {
      user: users_schema.parse(user),
      users_roles: user.user_roles.map((role) => UserRoleSchema.parse(role)),
    };
  });

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    success: true,
    data: {
      users: usersParsed,
      pagination: PaginationSchema.parse({
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      }),
    },
  };
}

export async function updateUserStatusAction(
  userId: string,
  status: user_status
): Promise<
  ActionResponse<{
    user: users;
    users_roles: user_roles[];
  }>
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }

  const userToUpdate = await prisma.users.update({
    where: { id: userId },
    data: { user_status_name: status },
  });
  await getUserById(userToUpdate.id);

  return {
    success: true,
    data: (await getUserById(userToUpdate.id)).data,
  };
}

export async function addUserRoleAction(
  userId: string,
  role: role_type
): Promise<
  ActionResponse<{
    user: users;
    users_roles: user_roles[];
  }>
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }

  const userToUpdate = await prisma.user_roles.upsert({
    where: {
      user_id_role_name: {
        user_id: userId,
        role_name: role,
      },
    },
    update: {},
    create: {
      user_id: userId,
      role_name: role,
    },
  });

  return {
    success: true,
    data: (await getUserById(userToUpdate.user_id)).data,
  };
}

export async function removeUserRoleAction(
  userId: string,
  role: role_type
): Promise<
  ActionResponse<{
    user: users;
    users_roles: user_roles[];
  }>
> {
  const user = await getUserAdmin();
  if (!user) {
    return {
      success: false,
      error_message: "error.user_not_authenticated",
    };
  }

  const userRole = await prisma.user_roles.delete({
    where: {
      user_id_role_name: {
        user_id: userId,
        role_name: role,
      },
    },
  });
  return {
    success: true,
    data: (await getUserById(userRole.user_id)).data,
  };
}
