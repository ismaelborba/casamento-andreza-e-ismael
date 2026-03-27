import { Header } from "@/src/components/layout/Header";
import { GiftsCartClient } from "@/src/components/sections/gifts/GiftsCartClient";
import { getPublicGifts } from "@/src/lib/admin-data";

export default async function GiftsCartPage() {
  const gifts = await getPublicGifts();

  return (
    <div className="gifts-page gifts-page--flow-header">
      <Header brandHref={null} showCart={false} floating={false} />
      <GiftsCartClient gifts={gifts} />
    </div>
  );
}
