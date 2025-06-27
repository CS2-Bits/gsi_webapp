"use client";
import Image from "next/image";
import { Button } from "../../ui/button";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HomeUserHeader from "./home-user-header";
import { Skeleton } from "../../ui/skeleton";
import { Gift, Store, Sword } from "lucide-react";

export default function HomeHeader() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle navigation to specific routes
  const handleNavigation = (route: string) => {
    router.push(route);
  };

  return (
    <header className="gaming-header container mx-auto py-4 px-4">
      <div className="gaming-slide-in flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        {/* Logo and Navigation Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Logo with gaming animation */}
          <Link href={"/"} className="flex-shrink-0 gaming-slide-in">
            <Image
              src="/CS2Bits-logo.png"
              alt="CS2 Bits Logo"
              width={50}
              height={50}
              className="hover:scale-110 transition-transform duration-200"
            />
          </Link>

          {/* Navigation Buttons with gaming styles */}
          <nav
            className="flex gap-2 sm:gap-3 gaming-slide-in"
            style={{ animationDelay: "0.1s" }}
            role="navigation"
            aria-label="Main navigation"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/matches")}
              className="gaming-text-secondary text-lg font-medium hover:bg-primary/20 hover:text-primary hover:scale-105 transition-all duration-200 flex items-center gap-2 border border-transparent hover:border-primary/30"
              aria-label={t("header.matches")}
            >
              <Sword className="h-4 w-4" />
              {t("header.matches")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/raffles")}
              className="gaming-text-secondary text-lg font-medium hover:bg-primary/20 hover:text-primary hover:scale-105 transition-all duration-200 flex items-center gap-2 border border-transparent hover:border-primary/30"
              aria-label={t("header.raffles")}
            >
              <Gift className="h-4 w-4" />
              {t("header.raffles")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gaming-text-secondary text-lg font-medium hover:bg-primary/20 hover:text-primary hover:scale-105 transition-all duration-200 flex items-center gap-2 border border-transparent hover:border-primary/30"
              aria-label={t("header.exchange")}
            >
              <Store className="h-4 w-4" />
              {t("header.exchange")}
            </Button>
          </nav>
        </div>

        {/* Authentication Section */}
        <div
          className="flex justify-center sm:justify-end gaming-slide-in"
          style={{ animationDelay: "0.2s" }}
        >
          {status === "loading" ? (
            <Skeleton className="gaming-skeleton h-10 w-[120px] rounded-lg" />
          ) : session ? (
            <HomeUserHeader />
          ) : (
            <Button
              onClick={async () => await signIn("steam")}
              className="gaming-button text-foreground flex items-center gap-2 font-semibold"
              aria-label={`${t("login")} Steam`}
            >
              <Image
                src="/steam-logo.png"
                alt="Steam Logo"
                width={30}
                height={30}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              {t("login")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
