"use client";
import { useTranslation } from "react-i18next";
import StreamerGuideBenefitsCard from "./streamers-guide-benefits-card";

function StremersGuideBenefits() {
  const { t } = useTranslation();
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-8 gaming-text-accent">
        {t("benefits.title")}
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        <StreamerGuideBenefitsCard
          title={t("benefits.engagement_title")}
          description={t("benefits.engagement_description")}
          content={[
            t("benefits.engagement_point_1"),
            t("benefits.engagement_point_2"),
            t("benefits.engagement_point_3"),
          ]}
        />
        <StreamerGuideBenefitsCard
          title={t("benefits.unique_content_title")}
          description={t("benefits.unique_content_description")}
          content={[
            t("benefits.unique_content_point_1"),
            t("benefits.unique_content_point_2"),
            t("benefits.unique_content_point_3"),
          ]}
        />
        <StreamerGuideBenefitsCard
          title={t("benefits.additional_revenue_title")}
          description={t("benefits.additional_revenue_description")}
          content={[
            t("benefits.additional_revenue_point_1"),
            t("benefits.additional_revenue_point_2"),
            t("benefits.additional_revenue_point_3"),
          ]}
        />
      </div>
    </section>
  );
}

export default StremersGuideBenefits;
