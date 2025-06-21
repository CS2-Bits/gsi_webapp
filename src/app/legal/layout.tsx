"use client";
import type React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="gaming-body">
      {/* Header with gaming animation */}
      <header className="gaming-header border-b border-border/30">
        <div className="container mx-auto py-6 px-4">
          <div className="gaming-slide-in flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="gaming-button"
            >
              <Link href="/">
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">{t("legalLayout.back")}</span>
              </Link>
            </Button>
            <div>
              <h1 className="gaming-text-primary text-2xl font-bold">
                {t("legalLayout.headerTitle")}
              </h1>
              <p className="gaming-text-secondary text-sm">
                {t("legalLayout.headerSubtitle")}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      {children}
    </div>
  );
}
