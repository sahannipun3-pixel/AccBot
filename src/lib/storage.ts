import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── Cloudflare R2 Client ────────────────────────────────────────────────────

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2 credentials are missing. Check R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "accbot-main-website";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

// ─── Upload File ─────────────────────────────────────────────────────────────

interface UploadOptions {
  /** The file contents as a Buffer or Uint8Array */
  body: Buffer | Uint8Array;
  /** MIME type, e.g. 'image/jpeg' */
  contentType: string;
  /** Path within the bucket, e.g. 'avatars/user-123.jpg' */
  path: string;
}

/**
 * Uploads a file to Cloudflare R2.
 * Returns the full public URL of the uploaded file.
 */
export async function uploadFile(options: UploadOptions): Promise<string> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const isConfigured =
    accountId &&
    accessKeyId &&
    secretAccessKey &&
    !accountId.includes("your-") &&
    !accessKeyId.includes("your-");

  if (!isConfigured) {
    console.warn("[storage] Cloudflare R2 credentials unconfigured. Returning base64 data URL fallback.");
    const base64 = Buffer.from(options.body).toString("base64");
    return `data:${options.contentType};base64,${base64}`;
  }

  const r2 = getR2Client();

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: options.path,
      Body: options.body,
      ContentType: options.contentType,
    })
  );

  return getPublicUrl(options.path);
}

// ─── Delete File ─────────────────────────────────────────────────────────────

/**
 * Deletes a file from Cloudflare R2 by its storage path.
 */
export async function deleteFile(path: string): Promise<void> {
  const r2 = getR2Client();

  await r2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
    })
  );
}

// ─── Get Public URL ───────────────────────────────────────────────────────────

/**
 * Returns the full public CDN URL for a file stored at the given path.
 */
export function getPublicUrl(path: string): string {
  if (!PUBLIC_URL) {
    throw new Error("R2_PUBLIC_URL environment variable is missing.");
  }
  return `${PUBLIC_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

// ─── Get Presigned Upload URL (for client-side uploads) ──────────────────────

/**
 * Generates a presigned URL that allows a client to upload directly to R2.
 * Useful for large files or client-side uploads without streaming through the server.
 * Expires in 15 minutes by default.
 */
export async function getPresignedUploadUrl(path: string, contentType: string, expiresIn = 900): Promise<string> {
  const r2 = getR2Client();

  return getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
      ContentType: contentType,
    }),
    { expiresIn }
  );
}

// ─── Path Helpers ─────────────────────────────────────────────────────────────

/**
 * Extracts the storage path from a full public R2 URL.
 * Useful when you need to delete a file by its URL.
 */
export function pathFromUrl(url: string): string {
  const base = PUBLIC_URL.replace(/\/$/, "");
  return url.replace(`${base}/`, "");
}

/**
 * Generates a unique file path for storage.
 * e.g. avatars/user-abc123-1234567890.jpg
 */
export function generatePath(folder: string, userId: string, filename: string): string {
  const ext = filename.split(".").pop() ?? "bin";
  const timestamp = Date.now();
  return `${folder}/${userId}-${timestamp}.${ext}`;
}
