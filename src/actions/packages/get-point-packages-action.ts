"use server";

import { prisma } from "@/lib/prisma";
import { point_packages_schema } from "@prisma-zod/generated/zod.schema";

export async function getPointPackagesAction() {
  try {
    const packages = await prisma.point_packages.findMany({
      where: {
        active: true,
      },
      orderBy: {
        points_amount: "asc",
      },
    });

    if (!packages) {
      return [];
    }

    return packages.map((pkg) => point_packages_schema.parse(pkg));
  } catch (error) {
    console.error("Error fetching point packages:", error);
    return [];
  }
}
