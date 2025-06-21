"use client";
import Image from "next/image";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { ContactModal } from "../contact/contact-modal";
import { useState } from "react";

function StremersGuideHero() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <div className="bg-gradient-to-r from-primary/20 to-black/40 rounded-2xl p-8 md:p-12 mb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold gaming-text-accent">
              {t("hero.stream_expirence")}
            </h2>
            <p className="text-xl gaming-text-secondary">
              {t("hero.stream_expirence_desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="gaming-button text-foreground font-semibold"
                onClick={() => setIsModalOpen(true)}
              >
                {t("hero.partner")}
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-border/30">
                <Image
                  src="https://placehold.co/480x270?text=Stream"
                  alt="Streamer Dashboard Preview"
                  width={480}
                  height={270}
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-primary w-3 h-3 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium gaming-text-accent">
                        {t("hero.live")}
                      </span>
                    </div>
                    <p className="font-bold gaming-text-accent">
                      {t("hero.live_desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ContactModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}

export default StremersGuideHero;
