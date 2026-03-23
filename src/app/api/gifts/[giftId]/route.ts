import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { gifts } from "@/src/db/schema";

type RouteContext = {
  params: Promise<{ giftId: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { giftId } = await params;
  const row = await db.select().from(gifts).where(eq(gifts.id, giftId)).limit(1);
  if (!row[0]) return NextResponse.json({ error: "Gift not found" }, { status: 404 });
  return NextResponse.json(row[0]);
}
