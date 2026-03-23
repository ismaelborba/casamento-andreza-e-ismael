import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/Header";
import { GiftsCustomerClient } from "@/src/components/sections/gifts/GiftsCustomerClient";
import { getPublicGifts } from "@/src/lib/admin-data";

export default async function GiftsCustomerPage() {
  const gifts = await getPublicGifts();

  return (
    <div className="gifts-page">
      <Header />
      <GiftsCustomerClient gifts={gifts} />
      <Footer />
    </div>
  );
}
