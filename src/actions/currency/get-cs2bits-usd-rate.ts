import { prisma } from "@/lib/prisma";
import { currency } from "@prisma/client";
import { getExchangeRate } from "./get-exchange-rate";
import { ActionError } from "@/types/action-error";

export async function getCs2BitsUsdRate() {
  const point_package = await prisma.point_packages.findFirst({
    where: {
      active: true,
    },
    orderBy: {
      points_amount: "asc",
    },
  });

  if (!point_package) {
    throw new ActionError("error.point_package_not_found");
  }

  // calculate exchange rate based on the point package and currency
  switch (point_package.currency) {
    case currency.USD:
    case currency.USDC:
      return point_package.points_amount.div(point_package.price);
    case currency.BRL:
      const rate = (await getExchangeRate(currency.BRL, currency.USD)).rate;
      const usd_price = point_package.price.mul(rate);
      return point_package.points_amount.div(usd_price);
    default:
      throw new ActionError("error.unsupported_currency");
  }
}
