import "server-only";

import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const R2_UPLOAD_PREFIX = "casamento";
const R2_FOLDER_MARKER_KEY = `${R2_UPLOAD_PREFIX}/.keep`;

type R2Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBaseUrl: string;
};

let r2Client: S3Client | null = null;
let folderReadyPromise: Promise<void> | null = null;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function cleanPathSegment(value: string) {
  return value.replace(/^\/+|\/+$/g, "");
}

function getR2Config(): R2Config {
  const endpoint = process.env.R2_ENDPOINT?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey =
    process.env.R2_SECRET_KEY?.trim() || process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim();

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName || !publicBaseUrl) {
    throw new Error(
      "As variaveis do Cloudflare R2 nao estao completas. Configure endpoint, chave, bucket e URL publica.",
    );
  }

  return {
    endpoint: trimTrailingSlash(endpoint),
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicBaseUrl: trimTrailingSlash(publicBaseUrl),
  };
}

function getR2Client() {
  if (r2Client) {
    return r2Client;
  }

  const config = getR2Config();

  r2Client = new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return r2Client;
}

function buildPublicUrl(key: string) {
  const { publicBaseUrl } = getR2Config();
  return `${publicBaseUrl}/${cleanPathSegment(key)}`;
}

async function ensureUploadFolder() {
  if (!folderReadyPromise) {
    folderReadyPromise = (async () => {
      const client = getR2Client();
      const { bucketName } = getR2Config();

      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: R2_FOLDER_MARKER_KEY,
          Body: "",
          ContentType: "text/plain",
        }),
      );
    })().catch((error) => {
      folderReadyPromise = null;
      throw error;
    });
  }

  await folderReadyPromise;
}

export async function uploadGiftImageToR2(input: {
  body: Buffer;
  contentType: string;
  extension: string;
}) {
  const client = getR2Client();
  const { bucketName } = getR2Config();
  const key = `${R2_UPLOAD_PREFIX}/${randomUUID()}${input.extension}`;

  await ensureUploadFolder();

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    key,
    url: buildPublicUrl(key),
  };
}

export async function ensureCasamentoFolderInR2() {
  await ensureUploadFolder();
}
