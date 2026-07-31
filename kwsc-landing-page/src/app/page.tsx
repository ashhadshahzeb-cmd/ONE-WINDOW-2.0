import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black selection:bg-white selection:text-black">
      <HeroSection />
      <FeaturesSection />
    </main>
  );
}
