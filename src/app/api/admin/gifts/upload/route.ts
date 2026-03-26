import { NextResponse } from "next/server";
import { uploadGiftImageToR2 } from "@/src/lib/r2";

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
  try {
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
    const arrayBuffer = await file.arrayBuffer();
    const uploaded = await uploadGiftImageToR2({
      body: Buffer.from(arrayBuffer),
      contentType: file.type,
      extension,
    });

    return NextResponse.json({
      ok: true,
      key: uploaded.key,
      url: uploaded.url,
    });
  } catch (error) {
    console.error("Erro ao enviar imagem para o Cloudflare R2.", error);

    return NextResponse.json(
      { error: "Nao foi possivel enviar a imagem para o Cloudflare R2." },
      { status: 500 },
    );
  }
}
