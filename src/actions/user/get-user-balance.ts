"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./get-current-user";
import {
  user_balances,
  user_balances_schema,
} from "@prisma-zod/generated/zod.schema";

export async function getUserBalance(): Promise<user_balances | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }
  let userBalance = await prisma.user_balances.findUnique({
    where: {
      user_id: user.id,
    },
  });

  if (!userBalance) {
    userBalance = await prisma.user_balances.create({
      data: {
        user_id: user.id,
        balance: 0,
        event_balance: 0,
      },
    });
  }
  return user_balances_schema.parse(userBalance);
}
