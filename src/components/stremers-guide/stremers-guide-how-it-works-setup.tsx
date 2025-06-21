"use client";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StreamerGuideHowItWorksSetup() {
  const { t } = useTranslation();

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-2xl font-bold mb-4 gaming-text-accent">
          {t("howItWorks.setup.title")}
        </h3>
        <ol className="space-y-6">
          <li className="flex gap-4">
            <div className="bg-primary/20 text-primary h-8 w-8 rounded-full flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-lg gaming-text-accent">
                {t("howItWorks.setup.steps.step1.title")}
              </h4>
              <p className="gaming-text-secondary">
                {t("howItWorks.setup.steps.step1.description")}
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="bg-primary/20 text-primary h-8 w-8 rounded-full flex items-center justify-center font-bold shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-lg gaming-text-accent">
                {t("howItWorks.setup.steps.step2.title")}
              </h4>
              <p className="gaming-text-secondary">
                {t("howItWorks.setup.steps.step2.description")}
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="bg-primary/20 text-primary h-8 w-8 rounded-full flex items-center justify-center font-bold shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-lg gaming-text-accent">
                {t("howItWorks.setup.steps.step3.title")}
              </h4>
              <p className="gaming-text-secondary">
                {t("howItWorks.setup.steps.step3.description")}
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="gaming-card">
        <h3 className="text-xl font-bold mb-4 gaming-text-accent">
          {t("howItWorks.setup.requirements.title")}
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-medium gaming-text-accent">
                {t("howItWorks.setup.requirements.items.cs2Game.name")}
              </span>
              <p className="text-sm gaming-text-secondary">
                {t("howItWorks.setup.requirements.items.cs2Game.description")}
              </p>
            </div>
          </li>

          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-medium gaming-text-accent">
                {t("howItWorks.setup.requirements.items.competitiveMode.name")}
              </span>
              <p className="text-sm gaming-text-secondary">
                {t(
                  "howItWorks.setup.requirements.items.competitiveMode.description"
                )}
              </p>
            </div>
          </li>

          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-medium gaming-text-accent">
                {t(
                  "howItWorks.setup.requirements.items.streamingPlatform.name"
                )}
              </span>
              <p className="text-sm gaming-text-secondary">
                {t(
                  "howItWorks.setup.requirements.items.streamingPlatform.description"
                )}
              </p>
            </div>
          </li>

          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-medium gaming-text-accent">
                {t(
                  "howItWorks.setup.requirements.items.gameStateIntegration.name"
                )}
              </span>
              <p className="text-sm gaming-text-secondary">
                {t(
                  "howItWorks.setup.requirements.items.gameStateIntegration.description"
                )}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
