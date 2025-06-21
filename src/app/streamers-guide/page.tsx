import StreamersGuideHeader from "@/components/stremers-guide/layout/streamers-guide-header";
import StremersGuideHero from "@/components/stremers-guide/streamers-guide-hero";
import StreamerGuideHowItWorks from "@/components/stremers-guide/stremers-guide-how-it-works";
import StremersGuideBenefits from "@/components/stremers-guide/stremers-guide-benefits";
import StreamersGuideCTA from "@/components/stremers-guide/streamers-guide-cta";

export default function StreamerGuidePage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header with gaming animation */}
      <div className="gaming-slide-up">
        <StreamersGuideHeader />
      </div>

      {/* Main Content */}
      <main className="container mx-auto py-12 px-4">
        {/* Hero Section with gaming animation */}
        <div className="gaming-slide-up" style={{ animationDelay: "0.1s" }}>
          <StremersGuideHero />
        </div>

        {/* Gaming divider */}
        <div className="gaming-divider"></div>

        {/* Benefits Section with gaming animation */}
        <div className="gaming-slide-up" style={{ animationDelay: "0.2s" }}>
          <StremersGuideBenefits />
        </div>

        {/* Gaming divider */}
        <div className="gaming-divider"></div>

        {/* How It Works Section with gaming animation */}
        <div className="gaming-slide-up" style={{ animationDelay: "0.3s" }}>
          <StreamerGuideHowItWorks />
        </div>

        {/* Gaming divider */}
        <div className="gaming-divider"></div>

        {/* CTA Section with gaming animation */}
        <div className="gaming-slide-up" style={{ animationDelay: "0.4s" }}>
          <StreamersGuideCTA />
        </div>
      </main>
    </div>
  );
}
