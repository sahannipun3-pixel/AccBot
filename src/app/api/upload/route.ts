import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-cookies";
import { uploadFile, generatePath } from "@/lib/storage";
import { updateProfile } from "@/actions/users";

/**
 * POST /api/upload
 *
 * Handles file uploads to Cloudflare R2.
 * Requires authentication via JWT cookie.
 *
 * Request: multipart/form-data with:
 *   - file: File (image/jpeg, image/png, image/webp, image/gif)
 *   - folder: string (e.g. "avatars", "team", "blog")
 *   - updateAvatar: "true" | "false" (optional — if true, updates user's avatar_url)
 *
 * Response: { success: true, url: string }
 */
export async function POST(request: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const payload = await verifyToken(accessToken);
    if (!payload?.sub) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    // ── Parse form data ─────────────────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";
    const updateAvatarFlag = formData.get("updateAvatar") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // ── Validate file type ──────────────────────────────────────────────────────
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG are allowed." },
        { status: 400 }
      );
    }

    // ── Validate file size (max 5MB) ───────────────────────────────────────────
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // ── Upload to R2 ────────────────────────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const storagePath = generatePath(folder, payload.sub, file.name);

    const publicUrl = await uploadFile({
      body: buffer,
      contentType: file.type,
      path: storagePath,
    });

    // ── Update avatar_url in DB if requested ───────────────────────────────────
    if (updateAvatarFlag) {
      await updateProfile(payload.sub, { avatar_url: publicUrl });
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("[/api/upload] Error:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
