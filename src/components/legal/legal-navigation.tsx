"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

export function LegalNavigation() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <div className="bg-card/30 border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-4 py-3">
          <Link
            href="/legal/terms-of-use"
            className={`text-base font-medium ${
              pathname === "/legal/terms-of-use"
                ? "text-primary border-b-2 border-primary"
                : "text-foreground/60 hover:text-foreground"
            } py-1`}
          >
            {t("legalNavigation.termsOfUse")}
          </Link>
          <Link
            href="/legal/privacy"
            className={`text-base font-medium ${
              pathname === "/legal/privacy"
                ? "text-primary border-b-2 border-primary"
                : "text-foreground/60 hover:text-foreground"
            } py-1`}
          >
            {t("legalNavigation.privacyPolicy")}
          </Link>
          <Link
            href="/legal/cookies"
            className={`text-base font-medium ${
              pathname === "/legal/cookies"
                ? "text-primary border-b-2 border-primary"
                : "text-foreground/60 hover:text-foreground"
            } py-1`}
          >
            {t("legalNavigation.cookiePolicy")}
          </Link>
        </div>
      </div>
    </div>
  );
}
