"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import StreamerGuideHowItWorksSetup from "./stremers-guide-how-it-works-setup";
import StreamerGuideHowItWorksIntegration from "./stremers-guide-how-it-works-revenue";
import { useTranslation } from "react-i18next";

function StreamerGuideHowItWorks() {
  const { t } = useTranslation();
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-8 gaming-text-accent">
        {t("howItWorks.title")}
      </h2>
      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="setup">{t("howItWorks.tabs.setup")}</TabsTrigger>
          <TabsTrigger value="revenue">
            {t("howItWorks.tabs.revenue")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="space-y-6">
          <StreamerGuideHowItWorksSetup />
        </TabsContent>
        <TabsContent value="revenue" className="space-y-6">
          <StreamerGuideHowItWorksIntegration />
        </TabsContent>
      </Tabs>
    </section>
  );
}

export default StreamerGuideHowItWorks;
