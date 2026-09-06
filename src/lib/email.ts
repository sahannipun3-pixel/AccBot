import { Resend } from "resend";

// ─── Resend Client ────────────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@accbot.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@accbot.com";

// ─── Email: Contact Form Notification ─────────────────────────────────────────

interface ContactNotificationData {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}

export async function sendContactNotification(data: ContactNotificationData) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[AccBot Inquiry] ${data.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width" />
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: #f5f7fa; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #C5A85C, #9A7E3E); padding: 28px 32px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">New Client Inquiry</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">Received via AccBot Contact Form</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 32px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; width: 120px;">
                    <span style="font-size: 12px; font-weight: 600; color: #9a7e3e; text-transform: uppercase; letter-spacing: 0.5px;">From</span>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="font-size: 14px; color: #1e1f22; font-weight: 500;">${data.name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="font-size: 12px; font-weight: 600; color: #9a7e3e; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <a href="mailto:${data.email}" style="color: #C5A85C; text-decoration: none; font-size: 14px;">${data.email}</a>
                  </td>
                </tr>
                ${data.phone ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="font-size: 12px; font-weight: 600; color: #9a7e3e; text-transform: uppercase; letter-spacing: 0.5px;">Phone</span>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="font-size: 14px; color: #1e1f22;">${data.phone}</span>
                  </td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="font-size: 12px; font-weight: 600; color: #9a7e3e; text-transform: uppercase; letter-spacing: 0.5px;">Subject</span>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="font-size: 14px; color: #1e1f22; font-weight: 600;">${data.subject}</span>
                  </td>
                </tr>
              </table>
              
              <div style="margin-top: 24px;">
                <p style="font-size: 12px; font-weight: 600; color: #9a7e3e; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px;">Message</p>
                <div style="background: #f9f8f5; border-left: 3px solid #C5A85C; padding: 16px 20px; border-radius: 4px;">
                  <p style="margin: 0; font-size: 14px; color: #3a3e4b; line-height: 1.7; white-space: pre-wrap;">${data.message}</p>
                </div>
              </div>

              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f0f0f0; text-align: center;">
                <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" 
                   style="display: inline-block; background: linear-gradient(135deg, #C5A85C, #9A7E3E); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                  Reply to ${data.name}
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="padding: 16px 32px; background: #f9f8f5; border-top: 1px solid #ede8dc; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #717680;">This email was generated automatically by AccBot • <a href="https://accbot.com" style="color: #C5A85C; text-decoration: none;">accbot.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[email] Contact notification error:", error);
      return { success: false };
    }
    return { success: true };
  } catch (err) {
    console.error("[email] Failed to send contact notification:", err);
    return { success: false };
  }
}

// ─── Email: Password Reset ─────────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, name: string, resetLink: string) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset Your AccBot Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: #f5f7fa; padding: 24px;">
          <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #C5A85C, #9A7E3E); padding: 28px 32px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Password Reset Request</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 15px; color: #3a3e4b; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
              <p style="font-size: 14px; color: #717680; line-height: 1.6; margin: 0 0 28px;">
                We received a request to reset your AccBot account password. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.
              </p>
              <div style="text-align: center; margin-bottom: 28px;">
                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #C5A85C, #9A7E3E); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 700;">
                  Reset My Password
                </a>
              </div>
              <p style="font-size: 12px; color: #9ca3af; line-height: 1.6; margin: 0;">
                If you didn't request this, you can safely ignore this email. Your password will remain unchanged.<br/><br/>
                If the button doesn't work, copy this link:<br/>
                <a href="${resetLink}" style="color: #C5A85C; word-break: break-all;">${resetLink}</a>
              </p>
            </div>
            <div style="padding: 16px 32px; background: #f9f8f5; border-top: 1px solid #ede8dc; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #717680;">AccBot • Smart Accounting & Advisory</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[email] Password reset email error:", error);
      return { success: false };
    }
    return { success: true };
  } catch (err) {
    console.error("[email] Failed to send password reset email:", err);
    return { success: false };
  }
}

// ─── Email: Welcome ───────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to AccBot — Your Account is Ready",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: #f5f7fa; padding: 24px;">
          <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #C5A85C, #9A7E3E); padding: 28px 32px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Welcome to AccBot!</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 15px; color: #3a3e4b; margin: 0 0 16px;">Hi <strong>${name}</strong>, welcome aboard!</p>
              <p style="font-size: 14px; color: #717680; line-height: 1.6; margin: 0 0 28px;">
                Your AccBot account has been created successfully. You now have access to our premium accounting and advisory services platform.
              </p>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://accbot.com"}/profile" 
                   style="display: inline-block; background: linear-gradient(135deg, #C5A85C, #9A7E3E); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 700;">
                  Go to My Account
                </a>
              </div>
            </div>
            <div style="padding: 16px 32px; background: #f9f8f5; border-top: 1px solid #ede8dc; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #717680;">AccBot • Smart Accounting & Advisory</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[email] Welcome email error:", error);
    }
  } catch (err) {
    console.error("[email] Failed to send welcome email:", err);
  }
}
