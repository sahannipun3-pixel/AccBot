"use server";

import { sql } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { logActivity } from "@/actions/activity";
import { contactFormSchema } from "@/lib/validators";
import { sendContactNotification } from "@/lib/email";
import type { ContactMessage } from "@/types";

// ─── Verification Helper ──────────────────────────────────────────────────────
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new Error("Unauthorized: Administrator privileges required.");
  }
  return user;
}

// ─── Submit Contact Form (Public) ─────────────────────────────────────────────

export async function submitContactForm(formData: unknown) {
  const result = contactFormSchema.safeParse(formData);
  if (!result.success) {
    return {
      success: false,
      error: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, subject, message } = result.data;

  try {
    const [inserted] = await sql<{ id: string }[]>`
      INSERT INTO contact_messages (name, email, phone, subject, message)
      VALUES (${name}, ${email}, ${phone || null}, ${subject}, ${message})
      RETURNING id
    `;

    // Send notification email to admin (non-blocking)
    sendContactNotification({ name, email, phone, subject, message }).catch(console.error);

    // Record activity log for incoming enquiry
    await logActivity({
      action: "receive_contact_message",
      entityType: "contact_message",
      entityId: inserted?.id,
      metadata: { sender_name: name, sender_email: email, subject },
    });

    return { success: true };
  } catch (err) {
    console.error("[messages] submitContactForm error:", err);
    return { success: false, error: "Failed to send message. Please try again." };
  }
}

// ─── Get Messages (Admin) ─────────────────────────────────────────────────────

interface GetMessagesOptions {
  page?: number;
  limit?: number;
  status?: "all" | "unread" | "read";
  search?: string;
}

export async function getMessages(
  options: GetMessagesOptions = {}
): Promise<{ messages: ContactMessage[]; total: number }> {
  try {
    await requireAdmin();
    const { page = 1, limit = 50, status = "all", search } = options;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status === "unread") {
      conditions.push(sql`is_read = false`);
    } else if (status === "read") {
      conditions.push(sql`is_read = true`);
    }

    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      conditions.push(
        sql`(name ILIKE ${searchPattern} OR email ILIKE ${searchPattern} OR subject ILIKE ${searchPattern} OR message ILIKE ${searchPattern})`
      );
    }

    const whereClause =
      conditions.length > 0
        ? sql`WHERE ${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)}`
        : sql``;

    const [messages, countResult] = await Promise.all([
      sql<ContactMessage[]>`
        SELECT id, name, email, phone, subject, message, is_read, created_at
        FROM contact_messages
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM contact_messages
        ${whereClause}
      `,
    ]);

    return {
      messages,
      total: parseInt(countResult[0]?.count ?? "0", 10),
    };
  } catch (err) {
    console.error("[messages] Failed to fetch messages from database:", err);
    return { messages: [], total: 0 };
  }
}

export async function getRecentMessages(limit = 5): Promise<ContactMessage[]> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return [];
    }

    const res = await sql<ContactMessage[]>`
      SELECT id, name, email, phone, subject, message, is_read, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return res;
  } catch (err) {
    console.error("[messages] Failed to fetch recent messages from database:", err);
    return [];
  }
}

export async function markMessageRead(
  id: string,
  isRead: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const [updated] = await sql<{ subject: string; name: string }[]>`
      UPDATE contact_messages
      SET is_read = ${isRead}
      WHERE id = ${id}
      RETURNING subject, name
    `;

    if (!updated) {
      return { success: false, error: "Message not found." };
    }

    await logActivity({
      action: isRead ? "mark_message_read" : "mark_message_unread",
      entityType: "contact_message",
      entityId: id,
      metadata: { sender_name: updated.name, subject: updated.subject },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[messages] markMessageRead error:", err);
    return { success: false, error: (err as Error).message || "Failed to update message status." };
  }
}

export async function deleteMessage(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const [target] = await sql<{ subject: string; name: string }[]>`
      SELECT subject, name FROM contact_messages WHERE id = ${id} LIMIT 1
    `;

    await sql`DELETE FROM contact_messages WHERE id = ${id}`;

    await logActivity({
      action: "delete_message",
      entityType: "contact_message",
      entityId: id,
      metadata: { sender_name: target?.name, subject: target?.subject },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[messages] deleteMessage error:", err);
    return { success: false, error: (err as Error).message || "Failed to delete message." };
  }
}

export async function getMessageCount(unreadOnly = false): Promise<number> {
  try {
    const [result] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text as count FROM contact_messages
      ${unreadOnly ? sql`WHERE is_read = false` : sql``}
    `;
    return parseInt(result?.count ?? "0", 10);
  } catch {
    return 0;
  }
}
