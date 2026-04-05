import { asc, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/src/db";
import { gifts } from "@/src/db/schema";

const reorderSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int().min(1),
});

export async function POST(req: Request) {
  try {
    const parsed = reorderSchema.safeParse(await req.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const orderedRows = await db
      .select({
        id: gifts.id,
        displayOrder: gifts.displayOrder,
      })
      .from(gifts)
      .orderBy(asc(gifts.displayOrder), desc(gifts.createdAt));

    const currentIndex = orderedRows.findIndex((row) => row.id === parsed.data.id);

    if (currentIndex === -1) {
      return NextResponse.json({ error: "Presente nao encontrado." }, { status: 404 });
    }

    const targetIndex = Math.min(
      orderedRows.length - 1,
      Math.max(0, parsed.data.position - 1),
    );

    if (currentIndex === targetIndex) {
      return NextResponse.json({ ok: true });
    }

    const nextOrder = [...orderedRows];
    const [movedRow] = nextOrder.splice(currentIndex, 1);
    nextOrder.splice(targetIndex, 0, movedRow);

    const currentOrderById = new Map(
      orderedRows.map((row) => [row.id, row.displayOrder]),
    );

    const changedRows = nextOrder
      .map((row, index) => ({ id: row.id, displayOrder: index + 1 }))
      .filter((row) => currentOrderById.get(row.id) !== row.displayOrder);

    if (changedRows.length === 0) {
      return NextResponse.json({ ok: true });
    }

    await db.transaction(async (tx) => {
      for (const row of changedRows) {
        await tx
          .update(gifts)
          .set({ displayOrder: row.displayOrder })
          .where(eq(gifts.id, row.id));
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Gift reorder failed", error);
    return NextResponse.json({ error: "Nao foi possivel reordenar os presentes." }, { status: 500 });
  }
}
