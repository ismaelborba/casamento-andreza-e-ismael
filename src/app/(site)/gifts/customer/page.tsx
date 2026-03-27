import { Header } from "@/src/components/layout/Header";
import { GiftsCustomerClient } from "@/src/components/sections/gifts/GiftsCustomerClient";
import { getPublicGifts } from "@/src/lib/admin-data";

export default async function GiftsCustomerPage() {
  const gifts = await getPublicGifts();

  return (
    <div className="gifts-page gifts-page--flow-header">
      <Header brandHref={null} showCart={false} floating={false} />
      <GiftsCustomerClient gifts={gifts} />
    </div>
  );
}
