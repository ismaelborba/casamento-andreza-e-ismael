import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { Couple } from "../../components/sections/Couple";
import { Event } from "../../components/sections/Event";
import { Gallery } from "../../components/sections/Gallery";
import { Hero } from "../../components/sections/Hero";
import { RSVP } from "../../components/sections/RSVP";
import { Story } from "../../components/sections/Story";

export default function Page() {
  return (
    <>
      <div className="page-wrapper">
        <Header />

        <div>
          <Hero />
          <Couple />
          <Story />
          <Gallery />
          <RSVP />
          <Event />
          <Footer />
        </div>
      </div>
    </>
  );
}