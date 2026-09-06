import Link from "next/link";
import { COMPANY } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy | AccBot Sri Lanka",
  description: "Learn how AccBot collects, uses, and protects your personal and financial information in Sri Lanka.",
};

export default function PrivacyPage() {
  const lastUpdated = "September 2026";

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="relative bg-gradient-to-b from-surface-warm via-surface to-background text-foreground dark:from-[#111317] dark:via-surface dark:to-background py-16 sm:py-20 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="container-custom relative z-10 text-center flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold mb-4">
            <Link href="/" className="hover:text-gold transition-colors text-muted-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Privacy Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-foreground mb-4">
            Privacy Policy
          </h1>
          <div className="gold-divider mb-4" />
          <p className="text-muted-foreground text-xs sm:text-sm">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-3xl">
          <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground space-y-8">

            <div className="p-5 rounded-2xl bg-gold/10 border border-gold/25 text-sm text-foreground leading-relaxed">
              This Privacy Policy explains how <strong>{COMPANY.name}</strong> (&ldquo;AccBot&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) collects, uses, and protects your personal information when you use our website and services in Sri Lanka. We are committed to protecting your privacy and handling your data in an open, ethical, and transparent manner.
            </div>

            <Section title="1. Information We Collect">
              <p>We may collect the following categories of personal information:</p>
              <ul>
                <li><strong>Account Information:</strong> Full name, email address, phone number, and password when you register on our portal.</li>
                <li><strong>Contact Form Data:</strong> Name, email, phone number, and inquiry details when you submit an inquiry.</li>
                <li><strong>Usage Data:</strong> IP address, browser type, pages visited, and timestamps (collected automatically via secure server logs).</li>
                <li><strong>Communications:</strong> Any correspondence you send to us via email, WhatsApp, or through our contact form.</li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, operate, and enhance our accounting, bookkeeping, and advisory services</li>
                <li>Create and manage your client account on our portal</li>
                <li>Respond to your service requests and provide technical support</li>
                <li>Send transactional notifications (account verification, password reset, statutory reminders)</li>
                <li>Comply with legal obligations under Sri Lankan statutory laws and Inland Revenue Department (IRD) regulations</li>
                <li>Detect and prevent financial fraud or unauthorized access</li>
              </ul>
            </Section>

            <Section title="3. Data Sharing">
              <p>We do not sell, trade, or rent your personal or financial information to third parties. We may share data only with:</p>
              <ul>
                <li><strong>Service Providers:</strong> Secure infrastructure providers (e.g. cloud database hosting, transactional email delivery) under strict confidentiality agreements.</li>
                <li><strong>Legal Authorities:</strong> Where required by Sri Lankan law, court order, or authorized regulatory bodies.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger or corporate restructuring, with prior notice.</li>
              </ul>
            </Section>

            <Section title="4. Data Security">
              <p>
                We implement robust technical and organizational security measures to protect your financial and personal data against unauthorized access, modification, or disclosure. These include TLS/HTTPS encryption, salted password hashing, HTTP-only secure cookies, and strict role-based access controls.
              </p>
            </Section>

            <Section title="5. Data Retention">
              <p>
                We retain personal data only for as long as necessary to provide services or satisfy statutory accounting and tax record-keeping requirements under Sri Lankan law. Contact inquiries are retained for business correspondence records. You may request deletion of non-statutory account data at any time.
              </p>
            </Section>

            <Section title="6. Your Rights">
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal records we hold about your profile</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your portal account</li>
                <li>Withdraw consent for marketing communications at any time</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{" "}
                <a href={`mailto:${COMPANY.email}`} className="text-gold hover:underline">
                  {COMPANY.email}
                </a>.
              </p>
            </Section>

            <Section title="7. Cookies">
              <p>
                Our platform uses strictly necessary cookies for session authentication (secure JWT tokens stored in HTTP-only cookies). These are essential for the portal to operate. We do not use intrusive third-party advertising cookies.
              </p>
            </Section>

            <Section title="8. Changes to This Policy">
              <p>
                We may update this Privacy Policy periodically. We will notify you of any material changes by updating the date at the top of this page.
              </p>
            </Section>

            <Section title="9. Contact Us">
              <p>
                If you have questions about this Privacy Policy or how your data is handled, please contact our team:
              </p>
              <div className="bg-surface rounded-2xl p-5 border border-border space-y-1.5 text-sm not-prose">
                <p className="font-bold text-foreground">{COMPANY.name}</p>
                <p className="text-muted-foreground">{COMPANY.address}</p>
                <p>
                  <a href={`mailto:${COMPANY.email}`} className="text-gold hover:underline">
                    {COMPANY.email}
                  </a>
                </p>
                <p className="text-muted-foreground">{COMPANY.phone}</p>
              </div>
            </Section>

          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold font-heading text-foreground">{title}</h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}
