import { users } from "@prisma/client";
import { getCurrentUser } from "../user/get-current-user";

export async function getUserAdmin(): Promise<users | null> {
  const user = await getCurrentUser();
  if (!user || !user.user_roles.some((role) => role.role_name === "Admin")) {
    return null;
  }
  return user;
}
