export type Gift = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  totalQuantity: number;
  purchasedQuantity: number;
  reservedQuantity: number;
};

export type CartItem = {
  giftId: string;
  quantity: number;
};

export type CartGiftItem = {
  gift: Gift;
  quantity: number;
};

export function availableQty(gift: Gift) {
  return Math.max(0, gift.totalQuantity - gift.purchasedQuantity - gift.reservedQuantity);
}
