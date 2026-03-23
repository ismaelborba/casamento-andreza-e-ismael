import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/src/db";
import { gifts } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";

const imageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || value.startsWith("/") || /^https?:\/\//i.test(value),
    "Informe uma URL valida ou envie uma imagem.",
  );

const giftSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(600).optional().nullable(),
  imageUrl: z.union([imageUrlSchema, z.literal(""), z.null()]).optional().nullable(),
  priceCents: z.number().int().min(1),
  totalQuantity: z.number().int().min(1).max(10000), // cotas
  active: z.boolean().default(true),
});

export async function GET() {
  const rows = await db.select().from(gifts).orderBy(desc(gifts.createdAt));
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  const parsed = giftSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const row = (
    await db
      .insert(gifts)
      .values({
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        imageUrl: parsed.data.imageUrl || null,
        priceCents: parsed.data.priceCents,
        totalQuantity: parsed.data.totalQuantity,
        active: parsed.data.active,
      })
      .returning()
  )[0];

  return NextResponse.json({ ok: true, gift: row });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const id = z.string().uuid().safeParse(body?.id);
  if (!id.success) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const parsed = giftSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const row = (
    await db
      .update(gifts)
      .set({
        ...parsed.data,
        imageUrl:
          parsed.data.imageUrl === undefined ? undefined : parsed.data.imageUrl || null,
        description:
          parsed.data.description === undefined ? undefined : parsed.data.description ?? null,
      })
      .where(eq(gifts.id, id.data))
      .returning()
  )[0];

  return NextResponse.json({ ok: true, gift: row });
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = z.object({ id: z.string().uuid() }).safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await db.delete(gifts).where(eq(gifts.id, parsed.data.id));
  return NextResponse.json({ ok: true });
}
