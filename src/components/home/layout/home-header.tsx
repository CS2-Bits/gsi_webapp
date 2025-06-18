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
    <header className="container mx-auto py-2 px-4">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        {/* Logo and Navigation Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Logo */}
          <Link href={"/"} className="flex-shrink-0">
            <Image
              src="/CS2Bits-logo.png"
              alt="CS2 Bits Logo"
              width={50}
              height={50}
            />
          </Link>

          {/* Navigation Buttons */}
          <nav
            className="flex gap-2 sm:gap-3"
            role="navigation"
            aria-label="Main navigation"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/matches")}
              className="text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
              aria-label={t("header.matches")}
            >
              <Sword className="h-4 w-4" />
              {t("header.matches")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/raffles")}
              className="text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
              aria-label={t("header.raffles")}
            >
              <Gift className="h-4 w-4" />
              {t("header.raffles")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
              aria-label={t("header.exchange")}
            >
              <Store className="h-4 w-4" />
              {t("header.exchange")}
            </Button>
          </nav>
        </div>

        {/* Authentication Section */}
        <div className="flex justify-center sm:justify-end">
          {status === "loading" ? (
            <Skeleton className="h-10 w-[120px]" />
          ) : session ? (
            <HomeUserHeader />
          ) : (
            <Button
              onClick={() =>
                signIn("steam", {
                  callbackUrl: window.location.href,
                  redirect: true,
                })
              }
              className="bg-primary hover:bg-primary/90 text-foreground flex items-center gap-2"
              aria-label={`${t("login")} with Steam`}
            >
              <Image
                src="/steam-logo.png"
                alt="Steam Logo"
                width={30}
                height={30}
              />
              {t("login")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
