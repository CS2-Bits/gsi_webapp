"use client";

import { LegalNavigation } from "@/components/legal/legal-navigation";
import { useTranslation } from "react-i18next";

export default function CookiePolicyPage() {
  const { t } = useTranslation();

  return (
    <>
      <LegalNavigation />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header with gaming animation */}
          <div className="gaming-slide-up prose prose-invert max-w-none">
            <h1 className="gaming-text-primary text-3xl font-bold mb-2">
              {t("cookiePolicy.title")}
            </h1>
            <p className="text-base text-foreground/60 mb-6">
              {t("cookiePolicy.lastUpdated")}
            </p>

            <p className="text-foreground/80 mb-6">{t("cookiePolicy.intro")}</p>

            {/* Gaming divider */}
            <div className="gaming-divider"></div>

            {/* Content sections with gaming animations */}
            <div className="gaming-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("cookiePolicy.whatAreCookies.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.whatAreCookies.description1")}
              </p>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.whatAreCookies.description2")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("cookiePolicy.whyUseCookies.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.whyUseCookies.description")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.3s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("cookiePolicy.typesCookies.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.typesCookies.description")}
              </p>

              <h3 className="gaming-text-secondary text-lg font-semibold mt-6 mb-3">
                {t("cookiePolicy.typesCookies.essential.title")}
              </h3>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.typesCookies.essential.description")}
              </p>

              <h3 className="gaming-text-secondary text-lg font-semibold mt-6 mb-3">
                {t("cookiePolicy.typesCookies.performance.title")}
              </h3>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.typesCookies.performance.description")}
              </p>

              <h3 className="gaming-text-secondary text-lg font-semibold mt-6 mb-3">
                {t("cookiePolicy.typesCookies.analytics.title")}
              </h3>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.typesCookies.analytics.description")}
              </p>

              <h3 className="gaming-text-secondary text-lg font-semibold mt-6 mb-3">
                {t("cookiePolicy.typesCookies.marketing.title")}
              </h3>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.typesCookies.marketing.description")}
              </p>

              <h3 className="gaming-text-secondary text-lg font-semibold mt-6 mb-3">
                {t("cookiePolicy.typesCookies.social.title")}
              </h3>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.typesCookies.social.description")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.4s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("cookiePolicy.controlCookies.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.controlCookies.description1")}
              </p>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.controlCookies.description2")}
              </p>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.controlCookies.description3Part1")}
                <a
                  href="http://www.aboutads.info/choices/"
                  className="gaming-text-secondary hover:text-primary hover:underline"
                >
                  {t("cookiePolicy.controlCookies.optOutLink1")}
                </a>
                {t("cookiePolicy.controlCookies.description3Part2")}
                <a
                  href="http://www.youronlinechoices.com"
                  className="gaming-text-secondary hover:text-primary hover:underline"
                >
                  {t("cookiePolicy.controlCookies.optOutLink2")}
                </a>
                {t("cookiePolicy.controlCookies.description3Part3")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.5s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("cookiePolicy.pastCookies.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.pastCookies.description")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.6s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("cookiePolicy.changesPolicy.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.changesPolicy.description")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.7s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("cookiePolicy.moreInfo.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("cookiePolicy.moreInfo.description")}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
