import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "failed",
  "canceled",
  "refunded",
  "expired",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "canceled",
  "refunded",
  "expired",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["pix", "credit_card", "boleto"]);
export const asaasEnvironmentEnum = pgEnum("asaas_environment", ["sandbox", "production"]);

export const gifts = pgTable("gifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  priceCents: integer("price_cents").notNull(),
  totalQuantity: integer("total_quantity").notNull().default(1),
  purchasedQuantity: integer("purchased_quantity").notNull().default(0),
  reservedQuantity: integer("reserved_quantity").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const buyers = pgTable("buyers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  asaasCustomerId: text("asaas_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id").notNull().references(() => buyers.id),
  buyerMessage: text("buyer_message"),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalAmountCents: integer("total_amount_cents").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  giftId: uuid("gift_id").notNull().references(() => gifts.id),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().unique().references(() => orders.id, { onDelete: "cascade" }),
  asaasPaymentId: text("asaas_payment_id").notNull().unique(),
  method: paymentMethodEnum("method").notNull().default("pix"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  amountCents: integer("amount_cents").notNull().default(0),
  feeAmountCents: integer("fee_amount_cents").notNull().default(0),
  installmentCount: integer("installment_count").notNull().default(1),
  installmentId: text("installment_id"),
  cardBrand: text("card_brand"),
  cardLast4: text("card_last4"),
  invoiceUrl: text("invoice_url"),
  pixQrCode: text("pix_qr_code"),
  pixPayload: text("pix_payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const asaasSettings = pgTable("asaas_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  environment: asaasEnvironmentEnum("environment").notNull().default("sandbox"),
  encryptedApiKey: text("encrypted_api_key").notNull(),
  encryptedWebhookToken: text("encrypted_webhook_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const giftRelations = relations(gifts, ({ many }) => ({
  items: many(orderItems),
}));

export const buyerRelations = relations(buyers, ({ many }) => ({
  orders: many(orders),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  buyer: one(buyers, { fields: [orders.buyerId], references: [buyers.id] }),
  items: many(orderItems),
  payment: one(payments),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  gift: one(gifts, { fields: [orderItems.giftId], references: [gifts.id] }),
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

export const rsvps = pgTable("rsvps", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),        // opcional
  phone: text("phone"),        // opcional
  attending: boolean("attending").notNull(), // true = vai, false = não vai
  guestsCount: integer("guests_count").notNull().default(1),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
