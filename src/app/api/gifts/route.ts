import { NextResponse } from "next/server";
import { getPublicGifts } from "@/src/lib/admin-data";

export async function GET() {
  const rows = await getPublicGifts();
  return NextResponse.json(rows);
}
