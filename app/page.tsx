import { CategorySection } from "@/components/home/category-section";
import { FeaturedServices } from "@/components/home/featured-services";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { WhyChooseSection } from "@/components/home/why-choose-section";

export default function Home() {
  return <main><HeroSection /><FeaturedServices /><CategorySection /><WhyChooseSection /><HowItWorksSection /></main>;
}
