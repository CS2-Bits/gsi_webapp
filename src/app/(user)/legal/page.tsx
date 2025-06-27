"use client";
import Link from "next/link";
import { FileText, Shield, Cookie } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function LegalPage() {
  const { t } = useTranslation();

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with gaming animation */}
        <div className="gaming-slide-up">
          <h2 className="gaming-text-primary text-3xl font-bold mb-6">
            {t("legalPage.title")}
          </h2>
          <p className="text-foreground/80 mb-8">{t("legalPage.subtitle")}</p>
        </div>

        {/* Gaming divider */}
        <div className="gaming-divider"></div>

        <div className="grid gap-6">
          {/* Terms of Use Card with gaming animation */}
          <div className="gaming-slide-up" style={{ animationDelay: "0.1s" }}>
            <Card className="gaming-card">
              <CardHeader className="flex flex-row items-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="gaming-text-accent">
                    {t("legalPage.terms.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("legalPage.terms.updated")}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-foreground/80">
                  {t("legalPage.terms.description")}
                </p>
                <Link
                  href="/legal/terms-of-use"
                  className="gaming-button inline-block text-foreground hover:scale-105 transition-transform"
                >
                  {t("legalPage.terms.read")}
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Policy Card with gaming animation */}
          <div className="gaming-slide-up" style={{ animationDelay: "0.2s" }}>
            <Card className="gaming-card">
              <CardHeader className="flex flex-row items-center gap-4">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="gaming-text-accent">
                    {t("legalPage.privacy.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("legalPage.privacy.updated")}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-foreground/80">
                  {t("legalPage.privacy.description")}
                </p>
                <Link
                  href="/legal/privacy"
                  className="gaming-button inline-block text-foreground hover:scale-105 transition-transform"
                >
                  {t("legalPage.privacy.read")}
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Cookie Policy Card with gaming animation */}
          <div className="gaming-slide-up" style={{ animationDelay: "0.3s" }}>
            <Card className="gaming-card">
              <CardHeader className="flex flex-row items-center gap-4">
                <Cookie className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="gaming-text-accent">
                    {t("legalPage.cookies.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("legalPage.cookies.updated")}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-foreground/80">
                  {t("legalPage.cookies.description")}
                </p>
                <Link
                  href="/legal/cookies"
                  className="gaming-button inline-block text-foreground hover:scale-105 transition-transform"
                >
                  {t("legalPage.cookies.read")}
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
