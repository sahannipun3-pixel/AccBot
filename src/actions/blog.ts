"use server";

import { sql } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { logActivity } from "@/actions/activity";
import type { BlogPost } from "@/types";

// ─── Verification Helper ──────────────────────────────────────────────────────
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new Error("Unauthorized: Administrator privileges required.");
  }
  return user;
}

// ─── Get Published Posts (Public) ─────────────────────────────────────────────

export async function getPublishedPosts(limit = 20): Promise<BlogPost[]> {
  try {
    const res = await sql<BlogPost[]>`
      SELECT id, title, slug, excerpt, content, cover_image, author_id,
             is_published, published_at, created_at, updated_at
      FROM blog_posts
      WHERE is_published = true
      ORDER BY published_at DESC NULLS LAST
      LIMIT ${limit}
    `;
    return res;
  } catch (err) {
    console.error("[blog] Failed to load published posts from database:", err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const [post] = await sql<BlogPost[]>`
      SELECT id, title, slug, excerpt, content, cover_image, author_id,
             is_published, published_at, created_at, updated_at
      FROM blog_posts
      WHERE slug = ${slug} AND is_published = true
      LIMIT 1
    `;
    return post ?? null;
  } catch (err) {
    console.error(`[blog] Failed to fetch post for slug '${slug}':`, err);
    return null;
  }
}

interface GetAllPostsOptions {
  page?: number;
  limit?: number;
  status?: "all" | "published" | "draft";
  search?: string;
}

export async function getAllPosts(
  options: GetAllPostsOptions = {}
): Promise<{ posts: BlogPost[]; total: number }> {
  try {
    await requireAdmin();
    const { page = 1, limit = 50, status = "all", search } = options;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status === "published") {
      conditions.push(sql`is_published = true`);
    } else if (status === "draft") {
      conditions.push(sql`is_published = false`);
    }

    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      conditions.push(
        sql`(title ILIKE ${searchPattern} OR slug ILIKE ${searchPattern} OR excerpt ILIKE ${searchPattern})`
      );
    }

    const whereClause =
      conditions.length > 0
        ? sql`WHERE ${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)}`
        : sql``;

    const [posts, countResult] = await Promise.all([
      sql<BlogPost[]>`
        SELECT id, title, slug, excerpt, content, cover_image, author_id,
               is_published, published_at, created_at, updated_at
        FROM blog_posts
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM blog_posts
        ${whereClause}
      `,
    ]);

    return {
      posts,
      total: parseInt(countResult[0]?.count ?? "0", 10),
    };
  } catch (err) {
    console.error("[blog] Failed to fetch all posts from database:", err);
    return { posts: [], total: 0 };
  }
}

// ─── Create Post (Admin) ──────────────────────────────────────────────────────

interface CreatePostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string | null;
  author_id?: string | null;
  is_published?: boolean;
}

export async function createPost(
  data: CreatePostData
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const admin = await requireAdmin();

    // Check slug uniqueness
    const [existing] = await sql<{ id: string }[]>`
      SELECT id FROM blog_posts WHERE slug = ${data.slug} LIMIT 1
    `;
    if (existing) {
      return { success: false, error: "A blog post with this URL slug already exists." };
    }

    const publishedAt = data.is_published ? new Date().toISOString() : null;
    const [created] = await sql<{ id: string }[]>`
      INSERT INTO blog_posts (
        title, slug, excerpt, content, cover_image, author_id, is_published, published_at
      )
      VALUES (
        ${data.title},
        ${data.slug},
        ${data.excerpt},
        ${data.content},
        ${data.cover_image ?? null},
        ${data.author_id ?? admin.id},
        ${data.is_published ?? false},
        ${publishedAt}
      )
      RETURNING id
    `;

    await logActivity({
      action: "create_blog_post",
      entityType: "blog_post",
      entityId: created.id,
      metadata: { title: data.title, slug: data.slug, is_published: data.is_published },
      userId: admin.id,
    });

    return { success: true, id: created.id };
  } catch (err) {
    console.error("[blog] createPost error:", err);
    return { success: false, error: (err as Error).message || "Failed to create post." };
  }
}

// ─── Update Post (Admin) ──────────────────────────────────────────────────────

export async function updatePost(
  id: string,
  data: Partial<CreatePostData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    if (data.slug) {
      const [existing] = await sql<{ id: string }[]>`
        SELECT id FROM blog_posts WHERE slug = ${data.slug} AND id != ${id} LIMIT 1
      `;
      if (existing) {
        return { success: false, error: "Another blog post is already using this URL slug." };
      }
    }

    const publishedAt =
      data.is_published === true
        ? new Date().toISOString()
        : data.is_published === false
        ? null
        : undefined;

    await sql`
      UPDATE blog_posts
      SET
        title        = COALESCE(${data.title ?? null}, title),
        slug         = COALESCE(${data.slug ?? null}, slug),
        excerpt      = COALESCE(${data.excerpt ?? null}, excerpt),
        content      = COALESCE(${data.content ?? null}, content),
        cover_image  = COALESCE(${data.cover_image ?? null}, cover_image),
        is_published = COALESCE(${data.is_published ?? null}, is_published),
        published_at = ${publishedAt !== undefined ? publishedAt : sql`published_at`},
        updated_at   = NOW()
      WHERE id = ${id}
    `;

    await logActivity({
      action: "update_blog_post",
      entityType: "blog_post",
      entityId: id,
      metadata: { title: data.title, is_published: data.is_published },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[blog] updatePost error:", err);
    return { success: false, error: (err as Error).message || "Failed to update post." };
  }
}

// ─── Delete Post (Admin) ──────────────────────────────────────────────────────

export async function deletePost(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const [target] = await sql<{ title: string }[]>`SELECT title FROM blog_posts WHERE id = ${id} LIMIT 1`;

    await sql`DELETE FROM blog_posts WHERE id = ${id}`;

    await logActivity({
      action: "delete_blog_post",
      entityType: "blog_post",
      entityId: id,
      metadata: { deleted_title: target?.title ?? id },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[blog] deletePost error:", err);
    return { success: false, error: (err as Error).message || "Failed to delete post." };
  }
}

export async function getBlogPostCount(publishedOnly = false): Promise<number> {
  try {
    const [result] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text as count FROM blog_posts
      ${publishedOnly ? sql`WHERE is_published = true` : sql``}
    `;
    return parseInt(result?.count ?? "0", 10);
  } catch {
    return 0;
  }
}
