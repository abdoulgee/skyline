import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSlider } from "@/components/hero-slider";
import { StatsSection } from "@/components/stats-section";
import { FeaturedCelebrities } from "@/components/featured-celebrities";
import { HowItWorks } from "@/components/how-it-works";
import { CTASection } from "@/components/cta-section";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSlider />
        <StatsSection />
        <FeaturedCelebrities />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
