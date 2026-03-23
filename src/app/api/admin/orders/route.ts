import { NextResponse } from "next/server";
import { getAdminOrders } from "@/src/lib/admin-data";

export async function GET() {
  const rows = await getAdminOrders();
  return NextResponse.json({ rows });
}
