import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/src/db";
import { rsvps } from "@/src/db/schema";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  attending: z.boolean(),
  guestsCount: z.number().int().min(1).max(10).default(1),
  message: z.string().max(280).optional().nullable(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const row = (
    await db
      .insert(rsvps)
      .values({
        name: parsed.data.name,
        email: parsed.data.email ?? null,
        phone: parsed.data.phone ?? null,
        attending: parsed.data.attending,
        guestsCount: parsed.data.guestsCount,
        message: parsed.data.message ?? null,
      })
      .returning()
  )[0];

  return NextResponse.json({ ok: true, rsvpId: row.id });
}