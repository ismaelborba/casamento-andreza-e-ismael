import { NextResponse } from "next/server";
import { z } from "zod";
import { parseAsaasError } from "@/src/lib/asaas-errors";
import {
  automaticAnticipationRate,
  getAutomaticAnticipationStatus,
  updateAutomaticAnticipationStatus,
} from "@/src/lib/asaasFinance";

const anticipationSchema = z.object({
  enabled: z.boolean(),
});

export async function GET() {
  try {
    const status = await getAutomaticAnticipationStatus();

    return NextResponse.json({
      ok: true,
      anticipation: {
        enabled: Boolean(status.creditCardAutomaticEnabled),
        rate: automaticAnticipationRate(),
        estimatedPayoutDays: 2,
      },
    });
  } catch (cause) {
    return NextResponse.json(
      {
        error: parseAsaasError(
          cause,
          "Não foi possível consultar a antecipação automática do Asaas.",
        ).description,
      },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  const parsed = anticipationSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const status = await updateAutomaticAnticipationStatus(parsed.data.enabled);

    return NextResponse.json({
      ok: true,
      anticipation: {
        enabled: Boolean(status.creditCardAutomaticEnabled),
        rate: automaticAnticipationRate(),
        estimatedPayoutDays: 2,
      },
    });
  } catch (cause) {
    return NextResponse.json(
      {
        error: parseAsaasError(
          cause,
          "Não foi possível atualizar a antecipação automática do Asaas.",
        ).description,
      },
      { status: 400 },
    );
  }
}
