"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useMobile } from "@/hooks/use-mobile";
import CS2BitsIcon from "../icons/CS2Bits-icon";
import Link from "next/link";

function HomeHeroSection() {
  const { t } = useTranslation();
  const isMobile = useMobile();

  return (
    <section className="container mx-auto px-4 py-6 md:py-20">
      <div className="grid md:grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-4 md:space-y-6">
          <h1 className="gaming-text-primary text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
            <span className="block gaming-slide-in">{t("hero.challenge")}</span>
            <span
              className="block gaming-slide-in"
              style={{ animationDelay: "0.1s" }}
            >
              {t("hero.predict")}
            </span>
            <span
              className="block gaming-slide-in"
              style={{ animationDelay: "0.2s" }}
            >
              {t("hero.engage")}
            </span>
          </h1>
          <p className="gaming-text-accent text-base md:text-xl">
            {t("hero.engage_streamer")}
          </p>
          <Link href={"/matches"}>
            <Button className="gaming-button text-foreground text-base md:text-lg px-6 py-2 md:px-8 md:py-6">
              {t("hero.live_cs2")}
            </Button>
          </Link>
        </div>

        <div className="relative mt-4 md:mt-0">
          <div className="relative rounded-xl overflow-hidden border border-border/30">
            <Image
              src="https://placehold.co/600x400?text=Streamer"
              alt="CS2 Gameplay"
              width={600}
              height={isMobile ? 300 : 400}
              className="w-full object-cover h-[250px] sm:h-[300px] md:h-[400px]"
              unoptimized
            />

            {/* Live Overlay */}
            <div className="absolute top-2 md:top-4 left-2 md:left-4 flex items-center gap-2">
              <Badge className="bg-primary text-foreground text-sm md:text-base">
                {t("hero.live")}
              </Badge>
              <span className="bg-card/50 px-2 py-1 rounded text-sm md:text-base">
                0:23
              </span>
            </div>

            {/* Game Info */}
            <div className="absolute top-2 md:top-4 left-2 md:left-4 mt-8 md:mt-12">
              <div className="bg-card/50 px-2 md:px-3 py-1 md:py-2 rounded">
                <div className="text-sm md:text-base">DUST2</div>
                <div className="font-bold text-sm md:text-base">K/D 0.8</div>
              </div>
            </div>

            {/* Challenge Card - Positioned differently on mobile */}
            <div
              className={`absolute ${isMobile ? "bottom-2 left-2" : "top-4 right-4"} w-[calc(50%-16px)] sm:w-48 md:w-56`}
            >
              <Card className="gaming-card bg-card/80 border-0 py-2">
                <CardContent className="p-2 md:px-4">
                  <div className="flex items-center gap-2 md:gap-2 mb-1 md:mb-2">
                    <CS2BitsIcon />
                    <span className="gaming-text-secondary font-medium text-sm md:text-base">
                      Desafio
                    </span>
                  </div>
                  <p className="gaming-text-primary text-base md:text-lg font-bold mb-2 md:mb-4">
                    Matar + de 30.5
                  </p>
                  <Button className="gaming-button w-full text-sm md:text-base h-7 md:h-9">
                    Enviar
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Predict Card */}
            <div
              className={`absolute bottom-2 right-2 md:bottom-4 md:right-4 w-[calc(50%-16px)] sm:w-48 md:w-56`}
            >
              <Card className="gaming-card bg-card/80 border-0 py-2">
                <CardContent className="p-2 md:px-4">
                  <div className="flex items-center gap-2 md:gap-2 mb-1 md:mb-2">
                    <CS2BitsIcon />
                    <span className="gaming-text-secondary font-medium text-sm md:text-base">
                      Quem vai vencer?
                    </span>
                  </div>
                  <div className="space-y-1 md:space-y-2 mb-2 md:mb-4 text-sm md:text-base">
                    <div className="flex justify-between gaming-text-accent">
                      <span>Streamer</span>
                      <span className="gaming-text-primary font-bold">
                        3,25
                      </span>
                    </div>
                    <div className="flex justify-between gaming-text-accent">
                      <span>Adversarios</span>
                      <span className="gaming-text-primary font-bold">
                        1,40
                      </span>
                    </div>
                  </div>
                  <Button className="gaming-button w-full text-sm md:text-base h-7 md:h-9">
                    Prever
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHeroSection;
