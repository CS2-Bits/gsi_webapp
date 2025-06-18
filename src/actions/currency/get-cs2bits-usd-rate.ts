import { prisma } from "@/lib/prisma";
import { currency } from "@prisma/client";
import Decimal from "decimal.js";
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
  const cs2bits_rate = point_package.points_amount.div(point_package.price);
  let usd_cs2bits_rate: Decimal;
  switch (point_package.currency) {
    case currency.USD:
    case currency.USDC:
      usd_cs2bits_rate = cs2bits_rate;
      break;
    case currency.BRL:
      const rate = (await getExchangeRate(currency.BRL, currency.USD)).rate;
      usd_cs2bits_rate = cs2bits_rate.mul(rate);
      break;
    default:
      throw new ActionError("error.unsupported_currency");
  }

  return usd_cs2bits_rate;
}
