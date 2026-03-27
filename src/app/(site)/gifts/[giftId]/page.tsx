import { notFound } from "next/navigation";
import { Header } from "@/src/components/layout/Header";
import { GiftProductClient } from "@/src/components/sections/gifts/GiftProductClient";
import { getPublicGifts } from "@/src/lib/admin-data";

type Props = {
  params: Promise<{ giftId: string }>;
};

export default async function GiftDetailPage({ params }: Props) {
  const { giftId } = await params;
  const gifts = await getPublicGifts();
  const gift = gifts.find((item) => item.id === giftId);

  if (!gift) {
    notFound();
  }

  return (
    <div className="gift-detail-page gift-detail-page--flow-header">
      <Header brandHref={null} floating={false} />
      <GiftProductClient gift={gift} gifts={gifts} />
    </div>
  );
}
