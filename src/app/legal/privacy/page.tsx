"use client";

import { LegalNavigation } from "@/components/legal/legal-navigation";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <>
      <LegalNavigation />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header with gaming animation */}
          <div className="gaming-slide-up prose prose-invert max-w-none">
            <h1 className="gaming-text-primary text-3xl font-bold mb-2">
              {t("privacyPolicy.title")}
            </h1>
            <p className="text-sm text-foreground/60 mb-6">
              {t("privacyPolicy.lastUpdated")}
            </p>

            <p className="text-foreground/80 mb-6">
              {t("privacyPolicy.intro")}
            </p>

            {/* Gaming divider */}
            <div className="gaming-divider"></div>

            {/* Content sections with gaming animations */}
            <div className="gaming-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("privacyPolicy.infoCollect.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.infoCollect.description")}
              </p>

              <h3 className="gaming-text-secondary text-lg font-semibold mt-6 mb-3">
                {t("privacyPolicy.infoCollect.personalInfo.title")}
              </h3>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.infoCollect.personalInfo.description")}
              </p>
              <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
                <li>
                  {t("privacyPolicy.infoCollect.personalInfo.items.firstName")}
                </li>
                <li>
                  {t("privacyPolicy.infoCollect.personalInfo.items.email")}
                </li>
                <li>
                  {t("privacyPolicy.infoCollect.personalInfo.items.username")}
                </li>
                <li>
                  {t(
                    "privacyPolicy.infoCollect.personalInfo.items.steamProfile"
                  )}
                </li>
                <li>
                  {t(
                    "privacyPolicy.infoCollect.personalInfo.items.dateOfBirth"
                  )}
                </li>
                <li>
                  {t(
                    "privacyPolicy.infoCollect.personalInfo.items.countryResidence"
                  )}
                </li>
              </ul>

              <h3 className="gaming-text-secondary text-lg font-semibold mt-6 mb-3">
                {t("privacyPolicy.infoCollect.usageInfo.title")}
              </h3>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.infoCollect.usageInfo.description")}
              </p>
              <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
                <li>
                  {t("privacyPolicy.infoCollect.usageInfo.items.accessLogs")}
                </li>
                <li>
                  {t(
                    "privacyPolicy.infoCollect.usageInfo.items.betsChallenges"
                  )}
                </li>
                <li>
                  {t("privacyPolicy.infoCollect.usageInfo.items.interactions")}
                </li>
                <li>
                  {t("privacyPolicy.infoCollect.usageInfo.items.preferences")}
                </li>
                <li>
                  {t("privacyPolicy.infoCollect.usageInfo.items.deviceInfo")}
                </li>
                <li>
                  {t("privacyPolicy.infoCollect.usageInfo.items.ipAddress")}
                </li>
              </ul>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("privacyPolicy.useInfo.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.useInfo.description")}
              </p>
              <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
                <li>{t("privacyPolicy.useInfo.items.provide")}</li>
                <li>{t("privacyPolicy.useInfo.items.process")}</li>
                <li>{t("privacyPolicy.useInfo.items.personalize")}</li>
                <li>{t("privacyPolicy.useInfo.items.communicate")}</li>
                <li>{t("privacyPolicy.useInfo.items.fraudPrevention")}</li>
                <li>{t("privacyPolicy.useInfo.items.legalCompliance")}</li>
                <li>{t("privacyPolicy.useInfo.items.analyze")}</li>
              </ul>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.3s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("privacyPolicy.sharingInfo.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.sharingInfo.description")}
              </p>
              <h3 className="gaming-text-secondary text-lg font-semibold mt-6 mb-3">
                {t("privacyPolicy.sharingInfo.serviceProviders.title")}
              </h3>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.sharingInfo.serviceProviders.description")}
              </p>

              <h3 className="gaming-text-secondary text-lg font-semibold mt-6 mb-3">
                {t("privacyPolicy.sharingInfo.legalRequirements.title")}
              </h3>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.sharingInfo.legalRequirements.description")}
              </p>

              <h3 className="gaming-text-secondary text-lg font-semibold mt-6 mb-3">
                {t("privacyPolicy.sharingInfo.protectionOfRights.title")}
              </h3>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.sharingInfo.protectionOfRights.description")}
              </p>

              <h3 className="gaming-text-secondary text-lg font-semibold mt-6 mb-3">
                {t("privacyPolicy.sharingInfo.businessTransfers.title")}
              </h3>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.sharingInfo.businessTransfers.description")}
              </p>
            </div>

            {/* Additional sections with gaming animations */}

            <div className="gaming-slide-up" style={{ animationDelay: "0.4s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("privacyPolicy.dataSecurity.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.dataSecurity.description")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.5s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("privacyPolicy.privacyRights.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.privacyRights.description")}
              </p>
              <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
                <li>{t("privacyPolicy.privacyRights.items.access")}</li>
                <li>{t("privacyPolicy.privacyRights.items.correct")}</li>
                <li>{t("privacyPolicy.privacyRights.items.delete")}</li>
                <li>{t("privacyPolicy.privacyRights.items.restrict")}</li>
                <li>{t("privacyPolicy.privacyRights.items.portability")}</li>
                <li>
                  {t("privacyPolicy.privacyRights.items.withdrawConsent")}
                </li>
              </ul>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.privacyRights.instructions")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.6s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("privacyPolicy.dataRetention.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.dataRetention.description")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.7s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("privacyPolicy.children.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.children.description")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.8s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("privacyPolicy.changes.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.changes.description")}
              </p>
            </div>

            <div className="gaming-slide-up" style={{ animationDelay: "0.9s" }}>
              <h2 className="gaming-text-accent text-xl font-bold mt-8 mb-4">
                {t("privacyPolicy.contact.title")}
              </h2>
              <p className="text-foreground/80 mb-4">
                {t("privacyPolicy.contact.intro")}
              </p>
              <p className="gaming-text-secondary mb-4">
                <strong>Email:</strong> contact@csbits.com
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
