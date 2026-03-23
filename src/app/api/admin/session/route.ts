import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_EMAIL,
  createAdminSessionToken,
  isAdminPasswordValid,
  normalizeAdminEmail,
} from "@/src/lib/admin-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function applySessionCookie(response: NextResponse, value: string) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados de login invalidos." }, { status: 400 });
  }

  const email = normalizeAdminEmail(parsed.data.email);

  if (email !== ADMIN_EMAIL) {
    return NextResponse.json(
      { error: "Somente o e-mail autorizado pode acessar o admin." },
      { status: 401 },
    );
  }

  if (!(await isAdminPasswordValid(parsed.data.password))) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const token = await createAdminSessionToken(email);
  const response = NextResponse.json({ ok: true, email });
  applySessionCookie(response, token);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
