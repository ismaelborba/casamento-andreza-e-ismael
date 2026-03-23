import { NextResponse } from "next/server";
import { getAdminRsvps } from "@/src/lib/admin-data";

export async function GET() {
  const rows = await getAdminRsvps();
  return NextResponse.json({ rows });
}
