import { Hero } from "@/components/home/hero";
import { Intro } from "@/components/home/intro";
import { Stats } from "@/components/home/stats";
import { Services } from "@/components/home/services";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { HowWeWork } from "@/components/home/how-we-work";
import { Team } from "@/components/home/team";
import { Testimonials } from "@/components/home/testimonials";
import { CallToAction } from "@/components/home/cta";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <Intro />
      <Stats />
      <Services />
      <WhyChooseUs />
      <HowWeWork />
      <Team />
      <Testimonials />
      <CallToAction />
    </div>
  );
}
