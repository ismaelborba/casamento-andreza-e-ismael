import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionFor(type: string) {
  switch (type) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}

export async function POST(req: Request) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato invalido. Use JPG, PNG, WEBP ou GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "A imagem precisa ter no maximo 5 MB." },
      { status: 400 },
    );
  }

  const extension = extensionFor(file.type);
  const fileName = `${randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "gifts");
  const filePath = path.join(uploadDir, fileName);
  const arrayBuffer = await file.arrayBuffer();

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, Buffer.from(arrayBuffer));

  return NextResponse.json({
    ok: true,
    url: `/uploads/gifts/${fileName}`,
  });
}
