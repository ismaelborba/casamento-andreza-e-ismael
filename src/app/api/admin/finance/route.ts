import { NextResponse } from "next/server";
import { getAdminFinance } from "@/src/lib/admin-data";

export async function GET() {
  const finance = await getAdminFinance();
  return NextResponse.json(finance);
}
