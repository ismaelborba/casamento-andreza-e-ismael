import { Recommendations } from "@/src/components/sections/Recommendations";
import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/Header";
import { Couple } from "@/src/components/sections/Couple";
import { Event } from "@/src/components/sections/Event";
import { Gallery } from "@/src/components/sections/Gallery";
import { Hero } from "@/src/components/sections/Hero";
import { RSVP } from "@/src/components/sections/RSVP";
import { Story } from "@/src/components/sections/Story";
import { Gifts } from "@/src/components/sections/Gifts";

export default function Page() {
  return (
    <div id="home" className="page-wrapper page-wrapper--home">
      <Header />

      <div>
        <Hero />
        <Couple />
        <Gallery />
        <Recommendations />
        <Gifts />
        <Event />
        <Footer />
      </div>
    </div>
  );
}
