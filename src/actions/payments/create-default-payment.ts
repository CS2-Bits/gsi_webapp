import { prisma } from "@/lib/prisma";
import {
  CreatePayment,
  CreatePaymentSchema,
} from "@/schemas/handle-payment.schema";
import { ActionError } from "@/types/action-error";
import { users } from "@prisma-zod/generated/zod.schema";

export async function createDefaultPayment(user: users, data: CreatePayment) {
  const validatedData = CreatePaymentSchema.parse(data);

  // Get the package
  const pointPackage = await prisma.point_packages.findUnique({
    where: {
      id: validatedData.packageId,
      active: true,
    },
  });

  if (!pointPackage) {
    throw new ActionError("error.package_not_found");
  }

  const payment = await prisma.user_payments.create({
    data: {
      user_id: user.id,
      provider: validatedData.provider,
      package_id: pointPackage.id,
      status: "Pending",
    },
  });

  return { payment, pointPackage };
}
