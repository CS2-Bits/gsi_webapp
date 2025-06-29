import { TimelineStatus } from "@/schemas/coinbase-payment-status.schema";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeSince(date: Date) {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  } else {
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours} h ${minutes} min`;
  }
}

export function formatPoints(value: number) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${formatted} CS2Bits`;
}

export function formatPrice(price: number, currency: string) {
  const currencyMap: Record<string, string> = {
    BRL: "$",
    USD: "$",
    USDC: "USDC $",
  };
  let locate = "pt-BR";
  if (currency === "USD") {
    locate = "en-US";
  } else if (currency === "USDC") {
    locate = "en-US";
  }

  return new Intl.NumberFormat(locate, {
    style: "currency",
    currency: currency === "USDC" ? "USD" : currency,
    currencyDisplay: "symbol",
  })
    .format(price)
    .replace("$", currencyMap[currency] || "$");
}

export function coinbaseGetLastEvent(timeline: TimelineStatus[]) {
  return timeline.reduce((prev, curr) => {
    return new Date(prev.time).getTime() > new Date(curr.time).getTime()
      ? prev
      : curr;
  });
}

export function getRarityGradient(item_type: string) {
  if (item_type.includes("Contraband")) {
    return "from-yellow-500/25 via-yellow-400/20 to-yellow-600/30";
  }
  if (item_type.includes("Covert")) {
    return "from-red-500/25 via-red-400/20 to-red-600/30";
  }
  if (item_type.includes("Classified")) {
    return "from-purple-500/25 via-purple-400/20 to-purple-600/30";
  }
  if (item_type.includes("Restricted")) {
    return "from-green-500/25 via-green-400/20 to-green-600/30";
  }
  if (item_type.includes("Mil-Spec")) {
    return "from-blue-500/25 via-blue-400/20 to-blue-600/30";
  }
  return "from-gray-500/25 via-gray-400/20 to-gray-600/30";
}
