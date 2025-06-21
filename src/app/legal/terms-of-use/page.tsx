"use client";
import { useTranslation } from "react-i18next";
import { LegalNavigation } from "@/components/legal/legal-navigation";

export default function TermsOfUsePage() {
  const { t } = useTranslation();

  return (
    <>
      <LegalNavigation />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header with gaming animation */}
          <div className="gaming-slide-up prose prose-invert max-w-none">
            <h1 className="gaming-text-primary text-3xl font-bold mb-2">
              {t("terms.title")}
            </h1>
            <p className="text-sm text-foreground/60 mb-6">
              {t("terms.lastUpdated")}
            </p>

            <p className="text-foreground/80 mb-6">{t("terms.intro")}</p>

            {/* Gaming divider */}
            <div className="gaming-divider"></div>

            {/* Content sections with gaming animations */}
            <div className="gaming-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("terms.acceptance.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("terms.acceptance.content")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("terms.eligibility.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("terms.eligibility.content")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.3s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("terms.account.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("terms.account.content1")}
              </p>
              <p className="text-foreground/80 mb-4">
                {t("terms.account.content2")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.4s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("terms.challenges.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("terms.challenges.intro1")}
              </p>
              <p className="text-foreground/80 mb-4">
                {t("terms.challenges.intro2")}
              </p>
              <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
                <li>{t("terms.challenges.items.1")}</li>
                <li>{t("terms.challenges.items.2")}</li>
                <li>{t("terms.challenges.items.3")}</li>
                <li>{t("terms.challenges.items.4")}</li>
                <li>{t("terms.challenges.items.5")}</li>
              </ul>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.5s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("terms.conduct.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("terms.conduct.intro")}
              </p>
              <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
                <li>{t("terms.conduct.items.1")}</li>
                <li>{t("terms.conduct.items.2")}</li>
                <li>{t("terms.conduct.items.3")}</li>
                <li>{t("terms.conduct.items.4")}</li>
                <li>{t("terms.conduct.items.5")}</li>
                <li>{t("terms.conduct.items.6")}</li>
                <li>{t("terms.conduct.items.7")}</li>
                <li>{t("terms.conduct.items.8")}</li>
              </ul>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.6s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("terms.intellectualProperty.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("terms.intellectualProperty.content1")}
              </p>
              <p className="text-foreground/80 mb-4">
                {t("terms.intellectualProperty.content2")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.7s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("terms.liability.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("terms.liability.content1")}
              </p>
              <p className="text-foreground/80 mb-4">
                {t("terms.liability.content2")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.8s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("terms.modifications.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("terms.modifications.content")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.9s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("terms.governingLaw.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("terms.governingLaw.content")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "1.0s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("terms.contact.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("terms.contact.intro")}
              </p>
              <p
                className="gaming-text-secondary mb-4"
                dangerouslySetInnerHTML={{ __html: t("terms.contact.email") }}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
