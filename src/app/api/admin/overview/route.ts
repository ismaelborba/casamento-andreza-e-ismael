import { NextResponse } from "next/server";
import { getAdminOverview } from "@/src/lib/admin-data";

export async function GET() {
  const overview = await getAdminOverview();
  return NextResponse.json(overview);
}
