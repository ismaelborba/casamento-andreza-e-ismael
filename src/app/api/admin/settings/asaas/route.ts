import { NextResponse } from "next/server";
import { z } from "zod";
import { getAsaasSettingsStatus, saveAsaasSettings } from "@/src/lib/asaas-config";

const settingsSchema = z.object({
  environment: z.enum(["sandbox", "production"]),
  apiKey: z.string().trim().optional(),
  webhookToken: z.string().trim().optional(),
});

export async function GET() {
  const status = await getAsaasSettingsStatus();
  return NextResponse.json({ status });
}

export async function PUT(request: Request) {
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const status = await saveAsaasSettings(parsed.data);
    return NextResponse.json({ ok: true, status });
  } catch (cause) {
    return NextResponse.json(
      { error: cause instanceof Error ? cause.message : "Não foi possível salvar as credenciais." },
      { status: 400 },
    );
  }
}
