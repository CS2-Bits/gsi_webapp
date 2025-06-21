import HomeHeroSection from "@/components/home/home-hero-section";
import HomeFeaturesSection from "@/components/home/home-features-section";
import HomeCTA from "@/components/home/home-cta";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession();

  if (session) {
    redirect("/matches");
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Hero Section with gaming animation */}
      <div className="gaming-slide-up">
        <HomeHeroSection />
      </div>

      {/* Gaming divider */}
      <div className="gaming-divider"></div>

      {/* Features Section with staggered animation */}
      <div className="gaming-slide-up" style={{ animationDelay: "0.2s" }}>
        <HomeFeaturesSection />
      </div>

      {/* Gaming divider */}
      <div className="gaming-divider"></div>

      {/* CTA Section with delayed animation */}
      <div className="gaming-slide-up" style={{ animationDelay: "0.4s" }}>
        <HomeCTA />
      </div>
    </div>
  );
}
