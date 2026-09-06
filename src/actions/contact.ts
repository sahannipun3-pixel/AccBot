"use server";

import { sql } from "@/lib/db";
import { contactFormSchema } from "@/lib/validators";
import { sendContactNotification } from "@/lib/email";

// ─── Submit Contact Form (Public) ─────────────────────────────────────────────
// This file is kept for backward compatibility with contact/page.tsx imports.
// It duplicates submitContactForm from messages.ts to avoid re-export bundler issues.

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
    await sql`
      INSERT INTO contact_messages (name, email, phone, subject, message)
      VALUES (${name}, ${email}, ${phone || null}, ${subject}, ${message})
    `;

    sendContactNotification({ name, email, phone, subject, message }).catch(console.error);

    return { success: true };
  } catch (err) {
    console.error("[messages] submitContactForm error:", err);
    return { success: false, error: "Failed to send message. Please try again." };
  }
}
