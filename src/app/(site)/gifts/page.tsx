import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/Header";
import { GiftsShopClient } from "@/src/components/sections/gifts/GiftsShopClient";
import { getPublicGifts } from "@/src/lib/admin-data";

type PageProps = {
  searchParams?: Promise<{ gift?: string }>;
};

export default async function GiftsPage({ searchParams }: PageProps) {
  const gifts = await getPublicGifts();
  const params = searchParams ? await searchParams : undefined;

  return (
    <div className="gifts-page">
      <Header />
      <GiftsShopClient gifts={gifts} initialGiftId={params?.gift} />
      <Footer />
    </div>
  );
}
